/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

/**
 * Amazon Connect Multi-User Web and Video Calling Sample application stack
 * - DynamoDB table for storing engagement data
 * - Lambda functions for backend operations
 * - API Gateway for REST API endpoints
 * - S3 bucket for frontend assets
 * - CloudFront distribution for content delivery
 */

import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import * as constants from "./constants";

export class MultipartySampleStack extends cdk.Stack {
  // Properties to store resources that need to be referenced across methods
  private engagementsTable: dynamodb.Table;
  private sharedLayer: lambda.LayerVersion;
  private lambdaFunctions: { [key: string]: lambda.Function } = {};
  private api: apigateway.RestApi;
  private websiteBucket: s3.Bucket;
  private distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the core infrastructure components
    this.createDatabaseResources();
    this.createLambdaResources();
    this.createApiGateway();
    this.createWebHosting();
    this.createOutputs();
  }

  /**
   * Create the DynamoDB table for storing engagement data
   */
  private createDatabaseResources(): void {
    // DynamoDB table for engagements with TTL to remove items after 24 hours
    this.engagementsTable = new dynamodb.Table(this, "Engagements", {
      partitionKey: {
        name: "engagement_id",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: "ttl", // TTL attribute
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Delete the table when the stack is deleted
    });
  }

  /**
   * Create Lambda functions and related resources
   */
  private createLambdaResources(): void {
    // Create a Lambda layer for shared code and dependencies
    this.sharedLayer = new lambda.LayerVersion(this, "SharedLayer", {
      code: lambda.Code.fromAsset("./lambda-layer"),
      compatibleRuntimes: [lambda.Runtime.NODEJS_22_X],
      description: "Common libraries and utilities",
    });

    // Common environment variables for all Lambda functions
    const commonEnvironmentVars = {
      DYNAMODB_ENGAGEMENTS_TABLE: this.engagementsTable.tableName,
      CONNECT_INSTANCE_ID: constants.CONNECT_INSTANCE_ID,
      CONNECT_CONTACT_FLOW_ID: constants.CONNECT_CONTACT_FLOW_ID,
    };

    // Define Lambda functions
    const lambdaDefinitions = [
      {
        name: "CreateOrJoinEngagement",
        handler: "createOrJoinEngagement.handler",
        codePath: "./lambda/createOrJoinEngagement",
        timeout: 30,
        permissions: "readwrite",
        needsConnectPermissions: true,
      },
      {
        name: "SearchEngagement",
        handler: "search.handler",
        codePath: "./lambda/search",
        timeout: 10,
        permissions: "read",
        needsConnectPermissions: false,
      },
      {
        name: "GetAttendee",
        handler: "attendee.handler",
        codePath: "./lambda/attendee",
        timeout: 10,
        permissions: "read",
        needsConnectPermissions: false,
      },
    ];

    // Create Lambda functions
    lambdaDefinitions.forEach((def) => {
      const fn = new lambda.Function(this, `${def.name}Function`, {
        runtime: lambda.Runtime.NODEJS_22_X,
        handler: def.handler,
        code: lambda.Code.fromAsset(def.codePath),
        layers: [this.sharedLayer],
        timeout: cdk.Duration.seconds(def.timeout),
        environment: commonEnvironmentVars,
      });

      // Store the function for later reference
      this.lambdaFunctions[def.name] = fn;

      // Grant DynamoDB permissions
      if (def.permissions === "readwrite") {
        this.engagementsTable.grantReadWriteData(fn);
      } else if (def.permissions === "read") {
        this.engagementsTable.grantReadData(fn);
      }
    });

    // Grant Connect permissions to functions that need it
    const connectPolicy = new iam.PolicyStatement({
      actions: [
        "connect:StartWebRTCContact",
        "connect:CreateParticipant",
        "connect:DescribeContact",
        "connectparticipant:CreateParticipantConnection",
      ],
      resources: ["*"], // Scope this down to specific resources in production
    });

    lambdaDefinitions
      .filter((def) => def.needsConnectPermissions)
      .forEach((def) => {
        this.lambdaFunctions[def.name].addToRolePolicy(connectPolicy);
      });
  }

  /**
   * Create API Gateway and endpoints
   */
  private createApiGateway(): void {
    this.api = new apigateway.RestApi(this, "MultipartySampleApi", {
      // Enable CORS
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ["Content-Type", "Authorization"],
      },
    });

    // API resources and methods
    const apiRoot = this.api.root.addResource("api");

    // Define API endpoints
    const endpoints = [
      {
        path: "join",
        method: "POST",
        functionKey: "CreateOrJoinEngagement",
      },
      {
        path: "search",
        method: "GET",
        functionKey: "SearchEngagement",
      },
      {
        path: "attendee",
        method: "GET",
        functionKey: "GetAttendee",
      },
    ];

    // Create API endpoints
    endpoints.forEach((endpoint) => {
      const resource = apiRoot.addResource(endpoint.path);
      resource.addMethod(
        endpoint.method,
        new apigateway.LambdaIntegration(
          this.lambdaFunctions[endpoint.functionKey]
        )
      );
    });
  }

  /**
   * Create web hosting resources (S3 and CloudFront)
   */
  private createWebHosting(): void {
    // S3 bucket for frontend assets
    this.websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Delete the bucket when the stack is deleted
      autoDeleteObjects: true, // Automatically delete objects when the bucket is deleted
    });

    // CloudFront Origin Access Identity
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      "OAI"
    );
    this.websiteBucket.grantRead(originAccessIdentity);

    // CloudFront distribution
    this.distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessIdentity(
          this.websiteBucket,
          {
            originAccessIdentity,
          }
        ),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        "/api/*": {
          origin: new origins.RestApiOrigin(this.api),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy:
            cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        },
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
      ],
    });
  }

  /**
   * Create CloudFormation outputs
   */
  private createOutputs(): void {
    // Output the CloudFront URL
    new cdk.CfnOutput(this, "DistributionDomainName", {
      value: this.distribution.distributionDomainName,
      description: "The domain name of the CloudFront distribution",
    });

    // Output the API Gateway URL
    new cdk.CfnOutput(this, "ApiGatewayUrl", {
      value: this.api.url,
      description: "The URL of the API Gateway",
    });

    // Output the S3 bucket name
    new cdk.CfnOutput(this, "WebsiteBucketName", {
      value: this.websiteBucket.bucketName,
      description: "The name of the S3 bucket",
    });
  }
}
