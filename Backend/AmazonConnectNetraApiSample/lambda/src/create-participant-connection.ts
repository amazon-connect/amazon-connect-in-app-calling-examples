//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import { APIGatewayProxyEventBase } from 'aws-lambda';
import {
    CreateParticipantConnectionCommand, CreateParticipantConnectionCommandInput,
  } from '@aws-sdk/client-connectparticipant';
import { createConnectParticipantClient } from './service-client-factory';
import { buildSuccessfulResponse, buildFailedResponse } from './response-builder';

const connectParticipantClient = createConnectParticipantClient();

exports.handler = (event: APIGatewayProxyEventBase<undefined>, context, callback) => {
    console.log("Received event: " + JSON.stringify(event));
    const body = JSON.parse(event["body"]!);

    createParticipantConnection(body).then((result) => {
        callback(null, buildSuccessfulResponse(result));
    }).catch((err) => {
        callback(null, buildFailedResponse(err));
    });
};

function createParticipantConnection(body) {

    if(!body || !body["ParticipantToken"]) {
        const err = new Error("Missing ParticipantToken");
        err["statusCode"] = "400";
        return Promise.reject(err)
    }
    const createParticipantConnectionInput: CreateParticipantConnectionCommandInput = {
        Type: ['CONNECTION_CREDENTIALS'],
        ParticipantToken: body["ParticipantToken"]
    };
    const command = new CreateParticipantConnectionCommand(createParticipantConnectionInput);
    return connectParticipantClient.send(command);
}
