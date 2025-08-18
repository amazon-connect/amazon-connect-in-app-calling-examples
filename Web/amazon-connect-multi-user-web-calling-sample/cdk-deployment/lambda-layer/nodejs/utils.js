/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

// Common utilities for Lambda functions

const CONTACT_STATUS = {
  CREATING: "creating",
  CREATED: "created",
};

/**
 * Common headers for all responses
 * 
 * Note: CORS headers are handled at the API Gateway level in the CDK stack.
 * The Content-Type header is still needed to specify the response format.
 */
const RESPONSE_HEADERS = {
  "Content-Type": "application/json",
};

/**
 * Create a formatted API response
 * @param {number} statusCode - HTTP status code
 * @param {Object} body - Response body
 * @returns {Object} Formatted API Gateway response
 */
const createResponse = (statusCode, body) => {
  return {
    statusCode,
    headers: RESPONSE_HEADERS,
    body: JSON.stringify(body),
  };
};

/**
 * Build capabilities based on feature flags
 * @param {boolean} isVideoEnabled - Whether video capability should be enabled
 * @param {boolean} isScreenshareEnabled - Whether screenshare capability should be enabled
 * @returns {Object} Capabilities object for Connect API
 */
const buildCapabilities = (isVideoEnabled, isScreenshareEnabled) => {
  const capabilities = {};
  if (isVideoEnabled) capabilities.Video = "SEND";
  if (isScreenshareEnabled) capabilities.ScreenShare = "SEND";
  return capabilities;
};

module.exports = {
  CONTACT_STATUS,
  RESPONSE_HEADERS,
  createResponse,
  buildCapabilities,
};
