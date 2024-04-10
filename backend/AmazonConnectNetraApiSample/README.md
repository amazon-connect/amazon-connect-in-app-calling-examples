# Amazon Connect In-App Calling Api Sample
This projects demonstrates how to invoke Amazon Connect’s API to start an in-app call with Amazon Connect.
This project will create three Amazon API Gateway endpoints to trigger AWS Lambda function to invoke Amazon Connect’s APIs. Your mobile applications (iOS or Android) can use these API Gateway endpoints to start the in-app call and send DTMF messages. 

> NOTE: this sample is for demo purposes. 

## Setup
This sample creates a set of AWS resources including Amazon API Gateways and AWS Lambdas using CDK. To deply the resources:

Please follow the [steps here](https://docs.aws.amazon.com/cdk/v2/guide/cli.html) to setup CDK before following the instructions below. 
 1. Git clone the repo.
 2. Set `INSTANCE_ID` and `CONTACT_FLOW_ID` in `./lib/config.ts`.
 3. Open terminal, go to project root directory.
 4. Configure your AWS credentials - https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html
 5. In terminal, run the command to build and deply the resources to your AWS account: `npm install && npm run build && cdk synth && cdk deploy`
 6. Once it's done, you will find a stack named `AmazonConnectInAppCallingApiSample` under Cloudformation.
 7. Navigate to `Outputs` under this stack, note down the values for `StartWebRtcContactApiUrl`, `CreateParticipantConnectionApiUrl` and `SendMessageApiUrl`. They will be needed for starting the mobile sample apps.