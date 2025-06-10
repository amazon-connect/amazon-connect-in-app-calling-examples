//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import { APIGatewayProxyEventBase } from 'aws-lambda';
import { createConnectClient } from './service-client-factory';
import { buildSuccessfulResponse, buildFailedResponse } from './response-builder';
import { StartWebRTCContactCommandInput } from '@aws-sdk/client-connect';

const connectClient = createConnectClient();

exports.handler = (event: APIGatewayProxyEventBase<undefined>, context, callback) => {
  console.log("Received event: " + JSON.stringify(event));
  const body = JSON.parse(event["body"]!);

  startWebRtcContact(body).then((result) => {
      callback(null, buildSuccessfulResponse(result));
  }).catch((err) => {
      callback(null, buildFailedResponse(err));
  });
};

function startWebRtcContact(body) {
  const contactFlowId = (body && body["ContactFlowId"]) ? body["ContactFlowId"] : process.env.CONTACT_FLOW_ID;
  const instanceId = (body && body["ConnectInstanceId"]) ? body["ConnectInstanceId"] : process.env.INSTANCE_ID;

  const displayName = (body && body["DisplayName"]) ? body["DisplayName"] : "Unknown caller";

  const attributes = (body && body["Attributes"]) ? body["Attributes"] : {};

  const startWebRtcInput: StartWebRTCContactCommandInput = {
    InstanceId: instanceId,
    ContactFlowId: contactFlowId,
    Attributes: attributes,
    ParticipantDetails: {
      DisplayName: displayName
    },
    AllowedCapabilities: {
      Customer: {
        Video: "SEND",
        ScreenShare: "SEND"
      },
      Agent: {
        Video: "SEND",
        ScreenShare: "SEND"
      }
    }
  };
  console.log("start WebRtc contact input: ", JSON.stringify(startWebRtcInput));
  return connectClient.startWebRTCContact(startWebRtcInput);
}
