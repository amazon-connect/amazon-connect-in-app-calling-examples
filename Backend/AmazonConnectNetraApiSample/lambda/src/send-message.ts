//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import { APIGatewayProxyEventBase } from 'aws-lambda';
import {
    SendMessageCommand, SendMessageCommandInput,
  } from '@aws-sdk/client-connectparticipant';
import { createConnectParticipantClient } from './service-client-factory';
import { buildSuccessfulResponse, buildFailedResponse } from './response-builder';

const connectParticipantClient = createConnectParticipantClient();
const DTMF_CONTENT_TYPE = 'audio/dtmf';

exports.handler = (event: APIGatewayProxyEventBase<undefined>, context, callback) => {
    console.log("Received event: " + JSON.stringify(event));
    const body = JSON.parse(event["body"]!);

    sendMessage(body).then((result) => {
        callback(null, buildSuccessfulResponse(result));
    }).catch((err) => {
        console.error(err)
        callback(null, buildFailedResponse(err));
    });
};

function sendMessage(body) {
    if(!body || !body["ConnectionToken"]) {
        const err = new Error("Missing ConnectionToken");
        err["statusCode"] = 400;
        return Promise.reject(err);
    }
    if(!body || !body["Digits"]) {
        const err = new Error("Missing DTMF digits");
        err["statusCode"] = 400;
        return Promise.reject(err);
    }
    const input: SendMessageCommandInput = {
        ConnectionToken: body["ConnectionToken"],
        ContentType: DTMF_CONTENT_TYPE,
        Content: body["Digits"]
    };
    const command = new SendMessageCommand(input);
    return connectParticipantClient.send(command);
}
