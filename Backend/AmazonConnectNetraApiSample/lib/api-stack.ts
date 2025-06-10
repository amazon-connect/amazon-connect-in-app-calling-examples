//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

import { Construct } from 'constructs';

type LAMBDA_ENV_TYPE = { [key: string]: string; };

export interface ApiStackProps {
  instanceId: string;
  contactFlowId: string;
  connectEndpoint: string | undefined;
  connectParticipantEndpoint: string | undefined;
}

export class ApiStack extends Construct {
  readonly startWebRtcContactApiUrl: string;
  readonly createParticipantConnectionApiUrl: string;
  readonly sendMessageApiUrl: string;

  constructor(scope: Construct, id: string, private props: ApiStackProps) {
    super(scope, id);

    const apiRole = this.createApiRole();

    const startWebRTCEnv = {
      CONTACT_FLOW_ID: this.props.contactFlowId,
      INSTANCE_ID: this.props.instanceId
    };
    if(this.props.connectEndpoint) {
      startWebRTCEnv["CONNECT_ENDPOINT"] = this.props.connectEndpoint
    }
    const startWebRtcHandler = this.createLambda(apiRole, 'StartWebRtcFunction', './lambda/src/start-webrtc-contact.ts', startWebRTCEnv);
    const startWebRtcContactApi = this.createApi(startWebRtcHandler, 'StartWebRtcContactApi');
    this.startWebRtcContactApiUrl = startWebRtcContactApi.url;

    const participantEnv = (this.props.connectParticipantEndpoint) ? {
      CONNECT_PARTICIPANT_ENDPOINT: this.props.connectParticipantEndpoint
    } : undefined;
    const createParticipantConnectionHandler = this.createLambda(apiRole, 'CreateParticipantConnectionFunction',
    './lambda/src/create-participant-connection.ts', participantEnv);
    const createParticipantConnectionApi = this.createApi(createParticipantConnectionHandler, 'CreateParticipantConnectionApi');
    this.createParticipantConnectionApiUrl = createParticipantConnectionApi.url;

    const sendMessageHandler = this.createLambda(apiRole, 'SendMessageFunction', './lambda/src/send-message.ts', participantEnv);
    const sendMessageApi = this.createApi(sendMessageHandler, 'SendMessageApi');
    this.sendMessageApiUrl = sendMessageApi.url;
  }

  private createApiRole = (): iam.Role => {
    return new iam.Role(this, 'ConnectApiRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        StartWebRtcContactPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: [
                'connect:*'
              ],
              resources: [
                `*`
              ],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
      },
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
    });
  };

  private createLambda = (role: iam.Role, id: string, entry: string, env: LAMBDA_ENV_TYPE | undefined = undefined): lambdaNodeJs.NodejsFunction => {
    const handler = new lambdaNodeJs.NodejsFunction(this, id, {
      entry,
      environment: env,
      handler: 'handler',
      role,
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(30),
    });
    return handler;
  };

  private createApi = (handler: lambdaNodeJs.NodejsFunction, id: string): apigateway.LambdaRestApi => {
    const api = new apigateway.LambdaRestApi(this, id, {
      handler,
      proxy: false,
    });
    api.root.addMethod('POST');
    return api;
  };
}
