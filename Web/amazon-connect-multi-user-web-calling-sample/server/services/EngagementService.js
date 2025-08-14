/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

/**
 * Engagement business logic service
 */
const { v4: uuidv4 } = require("uuid");
const { config } = require("../config/config");
const connectService = require("./ConnectService");
const engagementRepository = require("../repositories/EngagementRepository");
const {
  CONTACT_STATUS,
  EngagementNotReadyError,
  AgentNotConnectedError,
  MissingParametersError,
  buildCapabilities,
} = require("./EngagementHelpers");

// Initialize DynamoDB table
engagementRepository
  .createTableIfNotExists()
  .then(() =>
    console.log("[EngagementService] DynamoDB table initialization complete")
  )
  .catch((err) =>
    console.error(
      "[EngagementService] Failed to initialize DynamoDB table:",
      err
    )
  );

// Create a new engagement
const createEngagement = async (
  engagementId,
  displayName,
  isVideoCapabilitySet,
  isScreenshareCapabilitySet
) => {
  console.log(
    `[EngagementService.createEngagement] Creating engagement: ${engagementId}`
  );

  // Create engagement record
  await engagementRepository.createEngagement(engagementId, {
    participants: {},
    contactId: "",
    contactStatus: CONTACT_STATUS.CREATING,
  });

  let currentEngagement = await engagementRepository.getEngagement(
    engagementId
  );

  // Build capabilities for both customer and agent
  const capabilities = buildCapabilities(
    isVideoCapabilitySet,
    isScreenshareCapabilitySet
  );

  const connectResponse = await connectService.startWebRTCContact({
    ContactFlowId: config.connect.contactFlowId,
    InstanceId: config.connect.instanceId,
    AllowedCapabilities: {
      Customer: capabilities,
      Agent: capabilities,
    },
    ParticipantDetails: {
      DisplayName: displayName,
    },
  });

  // Update engagement with contact and participant info
  await engagementRepository.updateEngagement(engagementId, {
    participants: {
      ...currentEngagement.participants,
      [connectResponse.ParticipantId]: {
        displayName,
        participantToken: connectResponse.ParticipantToken,
        attendeeId: connectResponse.ConnectionData.Attendee.AttendeeId,
      },
    },
    contactId: connectResponse.ContactId,
    contactStatus: CONTACT_STATUS.CREATED,
  });

  console.log(
    "[EngagementService.createEngagement] StartWebRTCContact Response:",
    connectResponse
  );

  return {
    engagementId,
    participantId: connectResponse.ParticipantId,
    connectionData: connectResponse.ConnectionData,
  };
};

// Join an existing engagement
const joinEngagement = async (
  currentEngagement,
  displayName,
  isVideoCapabilitySet,
  isScreenshareCapabilitySet
) => {
  console.log(
    `[EngagementService.joinEngagement] Joining engagement: ${currentEngagement.engagementId}`
  );

  // Verify agent is connected
  const contactResponse = await connectService.describeContact({
    InstanceId: config.connect.instanceId,
    ContactId: currentEngagement.contactId,
  });

  console.log(
    "[EngagementService.joinEngagement] DescribeContact Response:",
    contactResponse
  );

  if (!contactResponse.Contact.AgentInfo) {
    throw new AgentNotConnectedError();
  }

  // Create participant with specified capabilities
  const participantCapabilities = buildCapabilities(
    isVideoCapabilitySet,
    isScreenshareCapabilitySet
  );

  const participantResponse = await connectService.createParticipant({
    InstanceId: config.connect.instanceId,
    ContactId: currentEngagement.contactId,
    ClientToken: uuidv4(),
    ParticipantDetails: {
      DisplayName: displayName,
      ParticipantRole: "CUSTOMER",
      ParticipantCapabilities: participantCapabilities,
    },
  });

  console.log(
    "[EngagementService.joinEngagement] CreateParticipant Response:",
    participantResponse
  );

  const {
    ParticipantCredentials: { ParticipantToken },
    ParticipantId,
  } = participantResponse;

  // Create WebRTC connection
  const connectionData = await connectService.createParticipantConnection({
    Type: ["WEBRTC_CONNECTION"],
    ParticipantToken: ParticipantToken,
    ConnectParticipant: true,
  });

  console.log(
    `[EngagementService.joinEngagement] Added new participant: ${ParticipantId}, ConnectionData: ${JSON.stringify(
      connectionData,
      null,
      2
    )}`
  );

  // Update engagement with new participant
  await engagementRepository.updateEngagement(currentEngagement.engagementId, {
    participants: {
      ...currentEngagement.participants,
      [ParticipantId]: {
        displayName,
        participantToken: ParticipantToken,
        attendeeId: connectionData.Attendee.AttendeeId,
      },
    },
  });

  return {
    engagementId: currentEngagement.engagementId,
    participantId: ParticipantId,
    connectionData,
  };
};

// Main create or join engagement logic
const createOrJoinEngagement = async ({
  displayName,
  engagementId,
  isVideoCapabilitySet,
  isScreenshareCapabilitySet,
}) => {
  console.log(
    `[EngagementService.createOrJoinEngagement] Processing request for engagement: ${
      engagementId || "new"
    }`
  );

  // Validate required parameters
  if (!displayName?.trim()) {
    throw new Error("Display name is required");
  }

  // Generate engagement ID if not provided
  if (!engagementId) {
    engagementId = uuidv4().slice(0, 8);
    console.log(
      `[EngagementService.createOrJoinEngagement] Generated new engagement ID: ${engagementId}`
    );
  }

  // Check if engagement exists
  let currentEngagement = await engagementRepository.getEngagement(
    engagementId
  );

  // Case 1: Engagement doesn't exist, create it
  if (!currentEngagement) {
    console.log(
      `[EngagementService.createOrJoinEngagement] Creating new engagement: ${engagementId}`
    );
    return await createEngagement(
      engagementId,
      displayName,
      isVideoCapabilitySet,
      isScreenshareCapabilitySet
    );
  }

  // Case 2: Engagement exists and is ready to join
  if (currentEngagement.contactStatus === CONTACT_STATUS.CREATED) {
    console.log(
      `[EngagementService.createOrJoinEngagement] Joining existing engagement: ${engagementId}`
    );
    return await joinEngagement(
      currentEngagement,
      displayName,
      isVideoCapabilitySet,
      isScreenshareCapabilitySet
    );
  }

  // Case 3: Engagement exists but is not ready (still creating)
  console.warn(
    `[EngagementService.createOrJoinEngagement] Engagement ${engagementId} is not ready (status: ${currentEngagement.contactStatus})`
  );
  throw new EngagementNotReadyError();
};

// Search engagement and participant details
const searchEngagement = async (engagementId, participantId) => {
  console.log(
    `[EngagementService.searchEngagement] Searching engagement: ${engagementId}, participant: ${participantId}`
  );

  const result = {
    engagementId: "",
    participantId: "",
    displayName: "",
    contactStatus: "",
  };

  const currentEngagement = await engagementRepository.getEngagement(
    engagementId
  );
  if (currentEngagement) {
    result.engagementId = engagementId;
    result.contactStatus = currentEngagement.contactStatus;

    const participant = currentEngagement.participants[participantId];
    if (participant) {
      result.participantId = participantId;
      result.displayName = participant.displayName;
    }
  }

  return result;
};

// Get attendee display name by engagement and attendee ID
const getAttendeeInfo = async (engagementId, attendeeId) => {
  console.log(
    `[EngagementService.getAttendeeInfo] Getting attendee info for engagement: ${engagementId}, attendee: ${attendeeId}`
  );

  if (!engagementId || !attendeeId) {
    throw new MissingParametersError(
      "Missing required parameters: engagementId and attendeeId"
    );
  }

  const currentEngagement = await engagementRepository.getEngagement(
    engagementId
  );
  let displayName = "";

  if (currentEngagement?.participants) {
    // Find participant by attendeeId
    const participant = Object.values(currentEngagement.participants).find(
      (p) => p.attendeeId === attendeeId
    );
    displayName = participant?.displayName || "";
  }

  return { displayName };
};

module.exports = {
  createOrJoinEngagement,
  searchEngagement,
  getAttendeeInfo,
};
