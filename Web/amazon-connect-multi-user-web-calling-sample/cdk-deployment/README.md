# AWS CDK Deployment for Amazon Connect Multi-User Web and Video Calling Sample

This directory contains the AWS CDK (Cloud Development Kit) code for deploying the Amazon Connect Multi-User Web and Video Calling Sample to AWS.

## Architecture

The deployment creates the following AWS resources:

- **Lambda Functions**: Serverless backend for the API with shared layer for common utilities
- **API Gateway**: REST API to expose the Lambda functions
- **DynamoDB Table**: For persistent storage of engagement data with TTL (24 hours)
- **S3 Bucket**: For hosting the static frontend assets
- **CloudFront Distribution**: For content delivery and HTTPS support with API Gateway integration
- **IAM Roles & Policies**: For Lambda functions to access AWS services

## Prerequisites

- Node.js v22 or higher
- AWS CLI configured with appropriate credentials
- AWS CDK v2 installed globally (`npm install -g aws-cdk`)

## Deployment

### Step 1: Configure Amazon Connect Settings

Update the values in `lib/constants.ts` with your Amazon Connect instance details:

```typescript
// In lib/constants.ts
export const STACK_NAME = "multi-user-video-calling-sample";
export const CONNECT_INSTANCE_ID = "your-connect-instance-id";
export const CONNECT_CONTACT_FLOW_ID = "your-connect-contact-flow-id";
```

**Important**: Replace the placeholder values with your actual Connect instance configuration.

### Step 2: Run the Deployment Script

Execute the deployment script to deploy the entire application:

```bash
./deploy.sh
```

The script will automatically:

- Validate prerequisites (AWS CLI, CDK, credentials)
- Install all dependencies
- Deploy the AWS infrastructure (Lambda, API Gateway, DynamoDB, S3, CloudFront)
- Build and deploy the frontend application
- Provide the CloudFront URL to access your application

### Deployment Options

For partial deployments:

```bash
./deploy.sh --backend   # Deploy only backend AWS stack
./deploy.sh --frontend  # Deploy only frontend assets to CloudFront
./deploy.sh --help      # Show usage information
```

## Lambda Functions

The deployment includes the following Lambda functions with a shared layer:

### Functions

- **CreateOrJoinEngagementFunction**: Creates a new engagement or joins an existing one (30s timeout, read/write DynamoDB, Connect permissions)
- **SearchEngagementFunction**: Searches for engagement and participant details (10s timeout, read-only DynamoDB)
- **GetAttendeeFunction**: Gets attendee information by engagement ID and attendee ID (10s timeout, read-only DynamoDB)

### Shared Lambda Layer

All functions use a shared Lambda layer (`lambda-layer/nodejs/`) that includes:

- Common utilities and helper functions
- AWS SDK clients for Connect services
- Shared dependencies to reduce function size
- Logger and response utilities

### Permissions

Lambda functions have the following permissions:

- **DynamoDB**: Read/write access to the engagements table (scoped by function needs)
- **Connect Services**: Access to StartWebRTCContact, CreateParticipant, DescribeContact, CreateParticipantConnection
- **CloudWatch Logs**: Automatic logging for all functions

### Environment Variables

Lambda functions receive configuration through environment variables:

- `DYNAMODB_ENGAGEMENTS_TABLE`: Name of the DynamoDB table
- `CONNECT_INSTANCE_ID`: Amazon Connect instance ID from constants.ts
- `CONNECT_CONTACT_FLOW_ID`: Amazon Connect contact flow ID from constants.ts

## DynamoDB Table

The DynamoDB table (`Engagements`) has the following structure:

- **Partition Key**: `engagement_id` (String)
- **TTL Attribute**: `ttl` (Number) - Items are automatically removed after 24 hours
- **Billing Mode**: Pay-per-request for cost optimization
- **Removal Policy**: Destroy (table is deleted when stack is deleted)

## API Gateway

The REST API provides the following endpoints with CORS enabled:

- `POST /api/join` - Create new engagement or join existing engagement
- `GET /api/search` - Search for engagement details
- `GET /api/attendee` - Get attendee information

All endpoints are integrated with their respective Lambda functions and support cross-origin requests.

## CloudFront Distribution

The CloudFront distribution provides:

- **Default Behavior**: Serves static assets from S3 with caching optimization
- **API Behavior**: Routes `/api/*` requests to API Gateway with caching disabled
- **HTTPS Redirect**: Automatically redirects HTTP to HTTPS
- **Error Handling**: Returns `index.html` for 404 errors (SPA support)
- **Origin Access Identity**: Secure access to S3 bucket

## Troubleshooting

### Common Issues

1. **Connect Configuration Errors**: Ensure all Connect values in `constants.ts` are valid and accessible
2. **Permission Errors**: Verify AWS credentials have sufficient permissions for CDK deployment
3. **Region Mismatch**: Ensure AWS CLI region matches your Connect instance region
4. **Node.js Version**: Verify you're using Node.js v22 or higher

### Deployment Validation

The deploy script validates:

- AWS CLI installation and credentials
- CDK installation (installs if missing)
- Connect configuration values (prevents deployment with placeholder values)
- Stack outputs before frontend deployment

### Logs and Monitoring

- **Lambda Logs**: Available in CloudWatch Logs with function-specific log groups
- **API Gateway Logs**: Can be enabled for request/response debugging
- **CloudFront Logs**: Available for distribution access patterns

## Cleanup

### Using the cleanup.sh Script

The project includes a cleanup script that removes all resources:

```bash
./cleanup.sh
```

This script performs the following steps:

1. **Prerequisites Check**: Validates AWS CLI and CDK
2. **Stack Validation**: Confirms stack exists before attempting cleanup
3. **Resource Cleanup**: Destroys the CDK stack and all associated resources
4. **Confirmation**: Provides feedback on cleanup completion

**Note**: The S3 bucket and DynamoDB table are configured with `RemovalPolicy.DESTROY` and will be automatically deleted when the stack is destroyed.

## Stack Outputs

After successful deployment, the following outputs are available:

- **DistributionDomainName**: CloudFront distribution URL for accessing the application
- **ApiGatewayUrl**: Direct API Gateway URL for backend testing
- **WebsiteBucketName**: S3 bucket name for manual asset uploads

Access your deployed application at: `https://{DistributionDomainName}`
