/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

/**
 * StateManager - Centralizes application state reset functionality
 */
import { eventBus } from "../services/EventBus.js";
import { APP_EVENTS } from "../services/EventTypes.js";
import { mediaModel } from "../models/MediaModel.js";
import { participantModel } from "../models/ParticipantModel.js";
import { engagementModel } from "../models/EngagementModel.js";

class StateManager {
  // Reset all models to their initial state
  resetState() {
    console.log("[StateManager] Resetting application state");
    
    // Reset media state
    mediaModel.updateMediaState({
      isAudioMuted: false,
      isVideoEnabled: false,
      isScreenShareAllowed: false,
      isScreenSharing: false,
      selectedCamera: null,
      selectedMicrophone: null,
      selectedSpeaker: null,
    });
    
    // Reset participant state
    participantModel.updateParticipantsState({
      local: {
        tileId: "",
        displayName: "",
        participantId: "",
        participantToken: "",
      },
      remote: {},
      screenSharer: {
        tileId: "",
        attendeeId: "",
        externalUserId: "",
      },
    });
    
    // Reset engagement state
    engagementModel.updateEngagementState({
      isActive: false,
      meetingInfo: {},
      engagementId: "",
      participantId: "",
    });
    
    // Publish state reset event
    eventBus.publish(APP_EVENTS.STATE_RESET);
  }
}

export const stateManager = new StateManager();
