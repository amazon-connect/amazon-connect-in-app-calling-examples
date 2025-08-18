/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

// CreateOrJoinEngagement Lambda
// Handles creating new engagements or joining existing ones with Amazon Connect
const { v4: uuidv4 } = require("uuid");
const dynamoDbService = require("/opt/nodejs/dynamoDbService");
const connectService = require("/opt/nodejs/connectService");
const logger = require("/opt/nodejs/logger");
const {
  CONTACT_STATUS,
  createResponse,
  buildCapabilities,
} = require("/opt/nodejs/utils");

// Custom error classes for handling specific engagement scenarios
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

exports.handler = async (event) => {
  try {
    logger.info("[CreateOrJoinEngagement.handler] Received request", {
      event: JSON.stringify(event, null, 2),
    });

    const body = JSON.parse(event.body || "{}");
    let {
      displayName,
      engagementId,
      isVideoCapabilitySet,
      isScreenshareCapabilitySet,
    } = body;

    // Validate required parameters
    if (!displayName?.trim()) {
      return createResponse(400, { error: "Display name is required" });
    }

    // Generate engagement ID if not provided
    if (!engagementId) {
      engagementId = uuidv4().slice(0, 8);
      logger.info("[CreateOrJoinEngagement.handler] Generated ID", {
        engagementId,
      });
    }

    const result = await handleEngagementWorkflow({
      engagementId,
      displayName,
      isVideoCapabilitySet,
      isScreenshareCapabilitySet,
    });

    return createResponse(200, result);
  } catch (error) {
    logger.error("[CreateOrJoinEngagement.handler] Error occurred", {
      errorMessage: error.message,
      errorName: error.name,
      errorStack: error.stack,
    });

    // Return appropriate status code based on error type
    if (error instanceof EngagementNotReadyError) {
      return createResponse(400, {
        error: error.message,
      });
    } else if (error instanceof AgentNotConnectedError) {
      return createResponse(400, {
        error: error.message,
      });
    }

    return createResponse(500, {
      error: "Failed to process engagement request: " + error.message,
    });
  }
};

// Engagement workflow handler - determines whether to create or join an engagement
async function handleEngagementWorkflow({
  engagementId,
  displayName,
  isVideoCapabilitySet,
  isScreenshareCapabilitySet,
}) {
  let engagement = await dynamoDbService.getEngagement(engagementId);

  if (!engagement) {
    logger.info(
      "[CreateOrJoinEngagement.handleEngagementWorkflow] Creating new engagement",
      {
        engagementId,
      }
    );
    return await createEngagement({
      engagementId,
      displayName,
      isVideoCapabilitySet,
      isScreenshareCapabilitySet,
    });
  }

  if (engagement.contactStatus === CONTACT_STATUS.CREATED) {
    logger.info(
      "[CreateOrJoinEngagement.handleEngagementWorkflow] Joining existing engagement",
      {
        engagementId,
      }
    );
    return await joinEngagement({
      engagement,
      displayName,
      isVideoCapabilitySet,
      isScreenshareCapabilitySet,
    });
  } else {
    logger.warn(
      "[CreateOrJoinEngagement.handleEngagementWorkflow] Engagement not ready",
      {
        engagementId,
        contactStatus: engagement.contactStatus,
      }
    );
    throw new EngagementNotReadyError();
  }
}

async function createEngagement({
  engagementId,
  displayName,
  isVideoCapabilitySet,
  isScreenshareCapabilitySet,
}) {
  logger.info("[CreateOrJoinEngagement.createEngagement] Starting engagement creation", {
    engagementId,
    displayName,
    isVideoCapabilitySet,
    isScreenshareCapabilitySet,
  });

  // Create engagement record
  await dynamoDbService.createEngagement(engagementId, {
    participants: {},
    contactId: "",
    contactStatus: CONTACT_STATUS.CREATING,
  });

  // Create WebRTC contact
  const capabilities = buildCapabilities(
    isVideoCapabilitySet,
    isScreenshareCapabilitySet
  );
  const connectResponse = await connectService.createWebRTCContact({
    ContactFlowId: process.env.CONNECT_CONTACT_FLOW_ID,
    InstanceId: process.env.CONNECT_INSTANCE_ID,
    AllowedCapabilities: {
      Customer: capabilities,
      Agent: capabilities,
    },
    ParticipantDetails: { DisplayName: displayName },
  });

  logger.info("[CreateOrJoinEngagement.createEngagement] WebRTC contact created", {
    engagementId,
    contactId: connectResponse.ContactId,
    participantId: connectResponse.ParticipantId,
  });

  // Update engagement record with contact info
  await dynamoDbService.updateEngagement(engagementId, {
    participants: {
      [connectResponse.ParticipantId]: {
        displayName,
        participantToken: connectResponse.ParticipantToken,
        attendeeId: connectResponse.ConnectionData.Attendee.AttendeeId,
      },
    },
    contactId: connectResponse.ContactId,
    contactStatus: CONTACT_STATUS.CREATED,
  });

  return {
    engagementId,
    participantId: connectResponse.ParticipantId,
    connectionData: connectResponse.ConnectionData,
  };
}

async function joinEngagement({
  engagement,
  displayName,
  isVideoCapabilitySet,
  isScreenshareCapabilitySet,
}) {
  logger.info("[CreateOrJoinEngagement.joinEngagement] Starting join process", {
    engagementId: engagement.engagementId,
    displayName,
    contactId: engagement.contactId,
  });

  // Verify agent is connected
  const contactResponse = await connectService.describeContact({
    InstanceId: process.env.CONNECT_INSTANCE_ID,
    ContactId: engagement.contactId,
  });

  // If an agent has not connected to the contact, throw AgentNotConnectedError
  if (!contactResponse.Contact.AgentInfo) {
    logger.warn("[CreateOrJoinEngagement.joinEngagement] Agent not connected", {
      engagementId: engagement.engagementId,
      contactId: engagement.contactId,
    });
    throw new AgentNotConnectedError();
  }

  // Create participant
  const participantCapabilities = buildCapabilities(
    isVideoCapabilitySet,
    isScreenshareCapabilitySet
  );
  const participantResponse = await connectService.createParticipant({
    InstanceId: process.env.CONNECT_INSTANCE_ID,
    ContactId: engagement.contactId,
    ClientToken: uuidv4(),
    ParticipantDetails: {
      DisplayName: displayName,
      ParticipantRole: "CUSTOMER",
      ParticipantCapabilities: participantCapabilities,
    },
  });

  // Create participant connection
  const connectionData = await connectService.createParticipantConnection({
    Type: ["WEBRTC_CONNECTION"],
    ParticipantToken:
      participantResponse.ParticipantCredentials.ParticipantToken,
    ConnectParticipant: true,
  });

  // Update engagement with new participant
  await dynamoDbService.updateEngagement(engagement.engagementId, {
    participants: {
      ...engagement.participants,
      [participantResponse.ParticipantId]: {
        displayName,
        participantToken:
          participantResponse.ParticipantCredentials.ParticipantToken,
        attendeeId: connectionData.Attendee.AttendeeId,
      },
    },
  });

  return {
    engagementId: engagement.engagementId,
    participantId: participantResponse.ParticipantId,
    connectionData: connectionData,
  };
}
