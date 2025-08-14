/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

/**
 * JoinFormController - Manages engagement creation/joining and view transitions
 */
import { joinFormView } from "../views/JoinFormView.js";
import { apiService } from "../services/ApiService.js";
import { engagementModel } from "../models/EngagementModel.js";
import { participantModel } from "../models/ParticipantModel.js";
import { viewManager, VIEW_TYPE } from "../managers/ViewManager.js";

// Contact status enum - matches server-side enum
const CONTACT_STATUS = {
  CREATING: "creating",
  CREATED: "created",
};

class JoinFormController {
  initialize() {
    console.log("[JoinFormController] Initializing controller");

    // Initialize the view with event handlers
    joinFormView.initialize(this.handleEngagement.bind(this));

    // Handle URL parameters
    this.handleUrlParameters();
  }

  // Extract engagement and participant IDs from URL
  getUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      engagementId: urlParams.get("engagementId") || "",
      participantId: urlParams.get("participantId") || "",
    };
  }

  // Update URL with engagement parameters
  updateUrlParameters(engagementId, participantId) {
    const url = new URL(window.location.href);
    if (engagementId) {
      url.searchParams.set("engagementId", engagementId);
    }
    if (participantId) {
      url.searchParams.set("participantId", participantId);
    }
    history.replaceState({}, "", url.toString());
  }

  // Update state models with engagement data
  updateModels(data, displayName) {
    engagementModel.setMeetingInfo(data.connectionData);
    engagementModel.setEngagementId(data.engagementId);
    engagementModel.setParticipantId(data.participantId);

    participantModel.setLocalParticipant(
      displayName,
      data.participantId,
      data.participantToken || ""
    );
  }

  // Process API response and update state
  handleApiResponse(response, displayName) {
    const { data, error, statusCode } = response;

    if (error) {
      const bannerType = statusCode === 400 ? "info" : "error";
      joinFormView.showBanner(error, bannerType);
      return;
    }

    if (!data || !data.connectionData) {
      joinFormView.showBanner(
        "Failed to connect. Missing connection data.",
        "error"
      );
      return;
    }

    // Update models with response data
    this.updateModels(data, displayName);

    // Update URL with engagement parameters
    this.updateUrlParameters(data.engagementId, data.participantId);
  }

  // Process URL parameters and transition to appropriate view
  async handleUrlParameters() {
    // Check if we have engagement ID and participant ID in URL
    const { engagementId, participantId } = this.getUrlParameters();

    console.log(
      `[JoinFormController] Processing URL parameters - engagementId: ${engagementId}, participantId: ${participantId}`
    );

    if (!engagementId) {
      // No engagement ID in URL, show default view
      return;
    }

    // Update view with engagement ID
    joinFormView.setEngagementId(engagementId, true);

    // Search for engagement
    const { data, error } = await apiService.searchEngagement(
      engagementId,
      participantId
    );

    if (error) {
      joinFormView.showBanner(error);
      return;
    }

    // Determine which view to show based on search results
    if (!data.engagementId) {
      // No engagement exists with this ID
      viewManager.switchToView(VIEW_TYPE.CREATE);
    } else if (data.contactStatus !== CONTACT_STATUS.CREATED) {
      // Engagement exists, but not ready for 3rd party participant to join
      viewManager.switchToView(VIEW_TYPE.JOIN);
      joinFormView.showBanner(
        "The engagement is not ready for participants to join. Please try again later."
      );
    } else if (!data.participantId && !data.displayName) {
      // Engagement exists, but the participant was not found
      viewManager.switchToView(VIEW_TYPE.JOIN);
    } else {
      // Engagement exists and the participant found
      joinFormView.setDisplayName(data.displayName, true);
      viewManager.switchToView(VIEW_TYPE.JOIN);
    }
  }

  // Handle form submission for creating or joining engagement
  async handleEngagement() {
    // Get form values
    const {
      displayName,
      engagementId,
      isVideoCapabilitySet,
      isScreenshareCapabilitySet,
    } = joinFormView.getFormValues();

    // Ensure displayName is entered
    if (!displayName || displayName.trim() === "") {
      joinFormView.showBanner("Please enter your name");
      return;
    }

    try {
      joinFormView.showLoading();

      // Single API call handles all the state checking and retry logic on the backend
      const response = await apiService.joinEngagement(
        displayName,
        engagementId,
        isVideoCapabilitySet,
        isScreenshareCapabilitySet
      );

      this.handleApiResponse(response, displayName);
    } catch (error) {
      joinFormView.showBanner("Failed to connect. Please try again.", "error");
    }
  }
}

export const joinFormController = new JoinFormController();
