/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

/**
 * Amazon Connect Service - Handles contact and participant management via Connect APIs
 */
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

// Initialize Amazon Connect clients
const connectClient = new ConnectClient();
const connectParticipantClient = new ConnectParticipantClient();

// Start WebRTC contact
const startWebRTCContact = async (params) => {
  const command = new StartWebRTCContactCommand(params);
  return await connectClient.send(command);
};

// Describe contact details
const describeContact = async (params) => {
  const command = new DescribeContactCommand(params);
  return await connectClient.send(command);
};

// Create participant
const createParticipant = async (params) => {
  const command = new CreateParticipantCommand(params);
  return await connectClient.send(command);
};

// Create participant connection
const createParticipantConnection = async (params) => {
  console.log("[ConnectService] Creating participant connection:", params);

  const command = new CreateParticipantConnectionCommand(params);
  const response = await connectParticipantClient.send(command);

  return response.WebRTCConnection;
};

module.exports = {
  startWebRTCContact,
  describeContact,
  createParticipant,
  createParticipantConnection,
};
