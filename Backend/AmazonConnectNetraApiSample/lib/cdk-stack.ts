//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiStack } from './api-stack';
import { INSTANCE_ID, CONTACT_FLOW_ID, CONNECT_ENDPOINT, CONNECT_PARTICIPANT_ENDPOINT } from './config';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    if (!INSTANCE_ID) {
      throw new Error(
        `INSTANCE_ID is missing! Assign your INSTANCE_ID to the variable INSTANCE_ID in the file 'backend/lib/cdk-stack.ts'.`
      );
    }

    if (!CONTACT_FLOW_ID) {
      throw new Error(
        `CONTACT_FLOW_ID is missing! Assign your CONTACT_FLOW_ID to the variable CONTACT_FLOW_ID in the file 'backend/lib/cdk-stack.ts'.`
      );
    }

    const apiStack = new ApiStack(this, 'ApiStack', {
      contactFlowId: CONTACT_FLOW_ID,
      instanceId: INSTANCE_ID,
      connectEndpoint: CONNECT_ENDPOINT,
      connectParticipantEndpoint: CONNECT_PARTICIPANT_ENDPOINT
    });

    // Create output values at the stack level to have an output name without prefix and postfix.
    const output = {
      StartWebRtcContactApiUrl: apiStack.startWebRtcContactApiUrl,
      CreateParticipantConnectionApiUrl: apiStack.createParticipantConnectionApiUrl,
      SendMessageApiUrl: apiStack.sendMessageApiUrl,
      Region: cdk.Stack.of(this).region,
    };
    for (const [key, value] of Object.entries(output)) {
      new cdk.CfnOutput(this, key, { value });
    }
  }
}
