/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

// AWS Connect service wrapper
// Provides methods for interacting with Amazon Connect APIs
const {
  ConnectClient,
  StartWebRTCContactCommand,
  CreateParticipantCommand,
  DescribeContactCommand,
} = require("@aws-sdk/client-connect");
const {
  ConnectParticipantClient,
  CreateParticipantConnectionCommand,
} = require("@aws-sdk/client-connectparticipant");

const connectClient = new ConnectClient({});
const connectParticipantClient = new ConnectParticipantClient({});

const createWebRTCContact = async (params) => {
  const command = new StartWebRTCContactCommand(params);
  return await connectClient.send(command);
};

const describeContact = async (params) => {
  const command = new DescribeContactCommand(params);
  return await connectClient.send(command);
};

const createParticipant = async (params) => {
  const command = new CreateParticipantCommand(params);
  return await connectClient.send(command);
};

const createParticipantConnection = async (params) => {
  console.log("[ConnectService.createParticipantConnection] param:", params);

  const command = new CreateParticipantConnectionCommand(params);
  const response = await connectParticipantClient.send(command);

  return response.WebRTCConnection;
};

module.exports = {
  createWebRTCContact,
  describeContact,
  createParticipant,
  createParticipantConnection,
};
