/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

/**
 * EngagementModel - Manages engagement state and events
 */
import { eventBus } from "../services/EventBus.js";
import { ENGAGEMENT_EVENTS } from "../services/EventTypes.js";

class EngagementModel {
  constructor() {
    // Initialize local state
    this.state = {
      isActive: false,
      meetingInfo: {},
      engagementId: "",
      participantId: "",
    };
  }

  getEngagementState() {
    return { ...this.state };
  }

  updateEngagementState(engagementData) {
    // Update local state
    this.state = {
      ...this.state,
      ...engagementData,
    };

    // Emit events for each changed property
    Object.keys(engagementData).forEach((key) => {
      switch (key) {
        case "isActive":
          eventBus.publish(
            ENGAGEMENT_EVENTS.ACTIVE_STATE_CHANGED,
            this.state.isActive
          );
          break;
        case "meetingInfo":
          eventBus.publish(
            ENGAGEMENT_EVENTS.MEETING_INFO_UPDATED,
            this.state.meetingInfo
          );
          break;
        case "engagementId":
          eventBus.publish(
            ENGAGEMENT_EVENTS.ENGAGEMENT_ID_UPDATED,
            this.state.engagementId
          );
          break;
        case "participantId":
          eventBus.publish(
            ENGAGEMENT_EVENTS.PARTICIPANT_ID_UPDATED,
            this.state.participantId
          );
          break;
      }
    });
  }

  setMeetingInfo(meetingInfo) {
    this.updateEngagementState({
      meetingInfo,
    });
  }

  setEngagementId(engagementId) {
    this.updateEngagementState({
      engagementId,
    });
  }

  setParticipantId(participantId) {
    this.updateEngagementState({
      participantId,
    });
  }

  setActive(isActive) {
    this.updateEngagementState({
      isActive,
    });
  }

  isActive() {
    return this.getEngagementState().isActive;
  }

  getMeetingInfo() {
    return this.getEngagementState().meetingInfo;
  }

  getEngagementId() {
    return this.getEngagementState().engagementId;
  }

  getParticipantId() {
    return this.getEngagementState().participantId;
  }
}

export const engagementModel = new EngagementModel();
