/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

// Get Attendee Lambda
// Retrieves attendee information based on engagementId and attendeeId
const dynamoDbService = require("/opt/nodejs/dynamoDbService");
const logger = require("/opt/nodejs/logger");
const { createResponse } = require("/opt/nodejs/utils");

exports.handler = async (event) => {
  try {
    logger.info("[AttendeeLambda.handler] Received event", {
      event: JSON.stringify(event, null, 2),
    });

    const queryParams = event.queryStringParameters || {};
    const { engagementId, attendeeId } = queryParams;

    // Validate required parameters
    if (!engagementId || !attendeeId) {
      logger.warn("[AttendeeLambda.handler] Missing parameters", { engagementId, attendeeId });
      return createResponse(400, {
        error:
          "Missing required parameters: engagementId and attendeeId are required",
      });
    }

    // Get engagement data
    const currentEngagement = await dynamoDbService.getEngagement(engagementId);
    if (!currentEngagement) {
      logger.debug(`[AttendeeLambda.handler] Engagement not found: ${engagementId}`);
    }

    // Initialize with empty display name
    let displayName = "";

    // Only try to find the participant if the engagement exists
    if (currentEngagement && currentEngagement.participants) {
      // Find participant by attendeeId
      for (const [participantId, participant] of Object.entries(
        currentEngagement.participants
      )) {
        if (participant.attendeeId === attendeeId) {
          // If found, use their display name
          displayName = participant.displayName || "";
          break;
        }
      }

      if (!displayName) {
        logger.debug(`[AttendeeLambda.handler] Attendee not found: ${attendeeId}`);
      }
    }

    // Return success response
    return createResponse(200, {
      displayName: displayName,
    });
  } catch (error) {
    logger.error(`[AttendeeLambda.handler] Error: ${error.message}`, {
      errorName: error.name,
      errorStack: error.stack,
    });

    // Return error response
    return createResponse(500, {
      error: "Failed to get attendee information: " + error.message,
    });
  }
};
