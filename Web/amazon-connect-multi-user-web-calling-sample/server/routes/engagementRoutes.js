/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

// API routes for engagement management
const express = require("express");
const engagementService = require("../services/EngagementService");
const {
  EngagementNotReadyError,
  AgentNotConnectedError,
  MissingParametersError,
} = require("../services/EngagementHelpers");

const router = express.Router();

// Create or join an engagement
router.post("/join", async (req, res) => {
  try {
    const {
      displayName,
      engagementId,
      isVideoCapabilitySet,
      isScreenshareCapabilitySet,
    } = req.body;

    const result = await engagementService.createOrJoinEngagement({
      displayName,
      engagementId,
      isVideoCapabilitySet,
      isScreenshareCapabilitySet,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("[engagementRoutes.join] Error:", error);

    // Handle specific error types
    if (error instanceof EngagementNotReadyError) {
      return res.status(400).json({ error: error.message });
    } else if (error instanceof AgentNotConnectedError) {
      return res.status(400).json({ error: error.message });
    } else if (error.name === "ResourceNotFoundException") {
      return res.status(404).json({ error: "The contact not found" });
    }

    // Default error handling
    res.status(500).json({
      error: "Failed to process engagement request: " + error.message,
    });
  }
});

// Search engagement and participant details
router.get("/search", async (req, res) => {
  try {
    const { engagementId, participantId } = req.query;
    const result = await engagementService.searchEngagement(
      engagementId,
      participantId
    );
    res.json(result);
  } catch (error) {
    console.error("[engagementRoutes.search] Error:", error);
    res.status(500).json({ error: "Failed to search engagement" });
  }
});

// Get attendee display name by engagement and attendee ID
router.get("/attendee", async (req, res) => {
  try {
    const { engagementId, attendeeId } = req.query;
    const result = await engagementService.getAttendeeInfo(engagementId, attendeeId);
    res.status(200).json(result);
  } catch (error) {
    console.error("[engagementRoutes.attendee] Error:", error);
    
    if (error instanceof MissingParametersError) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: "Failed to get attendee information" });
  }
});

module.exports = router;
