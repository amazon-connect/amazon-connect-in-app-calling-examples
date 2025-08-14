/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

/**
 * Engagement utilities and error classes
 */

const CONTACT_STATUS = {
  CREATING: "creating",
  CREATED: "created",
};

class EngagementNotReadyError extends Error {
  constructor() {
    super(`The engagement is not completely created. Please try again later.`);
    this.name = "EngagementNotReadyError";
  }
}

class AgentNotConnectedError extends Error {
  constructor() {
    super(`Agent not connected for the engagement. Please try again later.`);
    this.name = "AgentNotConnectedError";
  }
}

class MissingParametersError extends Error {
  constructor(message) {
    super(message);
    this.name = "MissingParametersError";
  }
}

// Build capabilities object based on feature flags
const buildCapabilities = (isVideoEnabled, isScreenshareEnabled) => {
  const capabilities = {};
  if (isVideoEnabled) capabilities.Video = "SEND";
  if (isScreenshareEnabled) capabilities.ScreenShare = "SEND";
  return capabilities;
};

module.exports = {
  CONTACT_STATUS,
  EngagementNotReadyError,
  AgentNotConnectedError,
  MissingParametersError,
  buildCapabilities,
};
