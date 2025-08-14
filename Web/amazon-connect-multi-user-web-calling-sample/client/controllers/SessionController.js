/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

/**
 * SessionController - Manages video session and media controls
 */
import { sessionView } from "../views/SessionView.js";
import { mediaModel } from "../models/MediaModel.js";
import { engagementModel } from "../models/EngagementModel.js";
import { participantModel } from "../models/ParticipantModel.js";
import { sessionService } from "../services/SessionService.js";
import { mediaService } from "../services/MediaService.js";
import { apiService } from "../services/ApiService.js";
import { eventBus } from "../services/EventBus.js";
import { MEDIA_EVENTS, ENGAGEMENT_EVENTS } from "../services/EventTypes.js";

class SessionController {
  initialize() {
    console.log("[SessionController] Initializing controller");

    // Initialize the view with event handlers
    sessionView.initialize(
      this.handleMuteAudio.bind(this),
      this.handleEnableVideo.bind(this),
      this.handleShareScreen.bind(this),
      this.handleLeave.bind(this)
    );

    // Subscribe to events
    this.subscribeToEvents();

    // Initial UI update based on current state
    this.updateUI(mediaModel.getMediaState());
  }

  // Set up event subscriptions for UI updates
  subscribeToEvents() {
    // Media events
    eventBus.subscribe(MEDIA_EVENTS.AUDIO_MUTE_CHANGED, (isMuted) =>
      sessionView.updateMuteAudioButton(isMuted)
    );

    eventBus.subscribe(MEDIA_EVENTS.VIDEO_ENABLED_CHANGED, (isEnabled) =>
      sessionView.updateEnableVideoButton(isEnabled)
    );

    eventBus.subscribe(MEDIA_EVENTS.SCREEN_SHARING_CHANGED, (isSharing) =>
      sessionView.updateShareScreenButton(isSharing)
    );

    eventBus.subscribe(MEDIA_EVENTS.SCREEN_SHARE_ALLOW_CHANGED, (isAllowed) =>
      sessionView.updateShareScreenButtonVisibility(isAllowed)
    );

    // Engagement events
    eventBus.subscribe(ENGAGEMENT_EVENTS.MEETING_INFO_UPDATED, (meetingInfo) =>
      this.handleMeetingInfoUpdated(meetingInfo)
    );
  }

  // Initialize and start session when meeting info is available
  async handleMeetingInfoUpdated(meetingInfo) {
    console.log("[SessionController] Meeting info updated");

    // Check if we need to initialize a session
    if (
      !meetingInfo ||
      Object.keys(meetingInfo).length === 0 ||
      sessionService.isActive()
    ) {
      return;
    }

    try {
      console.log("[SessionController] Initializing session controller");
      await sessionService.initialize(meetingInfo);

      // Start session
      console.log("[SessionController] Starting session");
      await sessionService.start();

      const videoElements = sessionView.getVideoElements();
      // Set up video elements
      sessionService.setupVideoElements(
        videoElements.localVideo,
        videoElements.screenShare,
        videoElements.remoteAudio,
        videoElements.remoteVideos,
        videoElements.remoteParticipantNames
      );

      // Update local participant name with the display name from participant model
      const localParticipant = participantModel.getLocalParticipant();
      if (localParticipant && localParticipant.displayName) {
        sessionView.updateLocalParticipantName(localParticipant.displayName);
      }
    } catch (error) {
      console.error("[SessionController] Error initializing session:", error);
    }
  }

  // Toggle audio mute state
  async handleMuteAudio() {
    try {
      mediaService.toggleMute();
    } catch (error) {
      console.error("[SessionController] Error toggling audio mute:", error);
    }
  }

  // Toggle video enabled state
  async handleEnableVideo() {
    try {
      await mediaService.toggleVideo();
    } catch (error) {
      console.error("[SessionController] Error toggling video:", error);
    }
  }

  // Toggle screen sharing state
  async handleShareScreen() {
    try {
      await mediaService.toggleScreenShare();
    } catch (error) {
      console.error("[SessionController] Error toggling screen share:", error);
    }
  }

  // End session and reset application state
  handleLeave() {
    try {
      // Stop the session
      console.log("[SessionController] Stopping the session");
      sessionService.leave();

      // Reset engagement state
      engagementModel.setActive(false);
      engagementModel.setMeetingInfo({});

      // Switch back to join view
      window.location.reload();
    } catch (error) {
      console.error("[SessionController] Error leaving session:", error);
    }
  }

  /**
   * Fetch attendee display name from server
   * @param {string} engagementId - Engagement ID
   * @param {string} attendeeId - Attendee ID
   * @param {Function} callback - Callback for display name result
   */
  getAttendeeDisplayName(engagementId, attendeeId, callback) {
    if (!engagementId || !attendeeId) {
      return;
    }

    apiService
      .getAttendee(engagementId, attendeeId)
      .then(({ data }) => {
        callback(data.displayName || "");
      })
      .catch((error) => {
        console.error(
          "[SessionController] Exception getting attendee display name:",
          error
        );
      });
  }

  // Update UI controls based on current media state
  updateUI(mediaState) {
    const {
      isAudioMuted,
      isVideoEnabled,
      isScreenSharing,
      isScreenShareAllowed,
    } = mediaState;

    sessionView.updateMuteAudioButton(isAudioMuted);
    sessionView.updateEnableVideoButton(isVideoEnabled);
    sessionView.updateShareScreenButton(isScreenSharing);
    sessionView.updateShareScreenButtonVisibility(isScreenShareAllowed);
  }
}

export const sessionController = new SessionController();
