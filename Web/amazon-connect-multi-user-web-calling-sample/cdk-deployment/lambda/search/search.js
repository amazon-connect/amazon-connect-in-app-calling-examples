/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

// Search Engagement Lambda
// Handles API requests to search for engagements and participants
const dynamoDbService = require("/opt/nodejs/dynamoDbService");
const logger = require("/opt/nodejs/logger");
const { createResponse } = require("/opt/nodejs/utils");

exports.handler = async (event) => {
  try {
    logger.info("[SearchLambda.handler] Received event", {
      event: JSON.stringify(event, null, 2),
    });

    // Get query parameters
    const queryParams = event.queryStringParameters || {};
    const { engagementId, participantId } = queryParams;

    let result = {
      engagementId: "",
      participantId: "",
      displayName: "",
      contactStatus: "",
    };

    // If no engagementId provided, return empty result
    if (!engagementId) {
      return createResponse(200, result);
    }

    // Get engagement data
    const currentEngagement = await dynamoDbService.getEngagement(engagementId);

    if (currentEngagement) {
      result.engagementId = engagementId;
      result.contactStatus = currentEngagement.contactStatus;

      const participant = currentEngagement.participants[participantId];
      if (participant) {
        result.participantId = participantId;
        result.displayName = participant.displayName;
      }
    }

    // Return success response with found data
    return createResponse(200, result);
  } catch (error) {
    logger.error(`[SearchLambda.handler] Error: ${error.message}`, {
      errorName: error.name,
      errorStack: error.stack,
    });

    return createResponse(500, {
      error: "Error searching for engagement: " + error.message,
    });
  }
};
