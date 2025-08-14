/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

/**
 * ParticipantService - Manages video tiles and participant connections
 */
import { participantModel } from "../models/ParticipantModel.js";
import { mediaModel } from "../models/MediaModel.js";
import { engagementModel } from "../models/EngagementModel.js";
import { sessionView } from "../views/SessionView.js";
import { sessionController } from "../controllers/SessionController.js";
import { mediaService } from "./MediaService.js";

const SCREEN_SHARING_TOPIC = "AMAZON_CONNECT_SCREEN_SHARING";
const DATA_MESSAGE_TYPES = {
  SCREEN_SHARING_STARTED: "ScreenSharingStarted",
  SCREEN_SHARING_STARTED_VIEW_ONLY: "ScreenSharingStartedViewOnly",
  SCREEN_SHARING_STOPPED: "ScreenSharingStopped",
};
class ParticipantService {
  constructor() {
    this.audioVideo = null;
  }

  initialize(audioVideo) {
    this.audioVideo = audioVideo;
  }

  // Set up local video stream and update participant model
  subscribeToLocalVideo(localVideoElement) {
    if (!this.audioVideo) return;

    const observer = {
      videoTileDidUpdate: (tileState) => {
        if (!tileState.boundAttendeeId || !tileState.localTile) return;
        this.audioVideo.bindVideoElement(tileState.tileId, localVideoElement);

        // Update local participant with tile ID using the model
        const localParticipant = participantModel.getLocalParticipant();
        participantModel.setLocalParticipant(
          localParticipant.displayName,
          localParticipant.participantId,
          localParticipant.participantToken,
          tileState.tileId
        );
      },
    };

    this.audioVideo.addObserver(observer);
  }

  // Set up screen sharing with content share observer
  subscribeToScreenShare(screenShareElement) {
    if (!this.audioVideo) return;

    // Subscribe to screen sharing data messages
    this.audioVideo.realtimeSubscribeToReceiveDataMessage(
      SCREEN_SHARING_TOPIC,
      this.handleScreenShareDataMessage.bind(this)
    );

    const observer = {
      videoTileDidUpdate: async (tileState) => {
        if (!tileState.boundAttendeeId || !tileState.isContent) return;
        // Allow the remote share to take over
        if (
          mediaModel.isScreenSharing() &&
          tileState.tileId !== participantModel.getScreenSharer().tileId
        ) {
          await mediaService.toggleScreenShare();
        }

        this.audioVideo.bindVideoElement(tileState.tileId, screenShareElement);

        // Update screen sharer info using the model
        participantModel.setScreenSharer(
          tileState.tileId,
          tileState.boundAttendeeId,
          tileState.boundExternalUserId
        );

        // if the external user ID ends with "_participant", set display name as Agent
        if (
          tileState.boundExternalUserId &&
          tileState.boundExternalUserId.endsWith("_participant")
        ) {
          sessionView.updateScreenSharerName("Agent");
        } else {
          // Otherwise, get the attendee display name from the server
          const engagementId = engagementModel.getEngagementId();
          const attendeeId = tileState.boundAttendeeId.split("#")[0];

          sessionController.getAttendeeDisplayName(
            engagementId,
            attendeeId,
            (displayName) => {
              if (displayName) {
                sessionView.updateScreenSharerName(displayName);
              }
            }
          );
        }
      },
      videoTileWasRemoved: (tileId) => {
        const screenSharer = participantModel.getScreenSharer();
        if (screenSharer && screenSharer.tileId === tileId) {
          // Clear screen sharer using the model
          participantModel.clearScreenSharer();

          // Update UI to clear screen sharer name
          sessionView.updateScreenSharerName("");
        }
      },
    };

    this.audioVideo.addObserver(observer);

    const contentShareObserver = {
      contentShareDidStart: () => {
        mediaModel.setScreenSharing(true);
      },
      contentShareDidStop: () => {
        mediaModel.setScreenSharing(false);
      },
    };
    this.audioVideo.addContentShareObserver(contentShareObserver);
  }

  // Set up remote participant video streams
  subscribeToRemoteVideos() {
    if (!this.audioVideo) return;

    const observer = {
      videoTileDidUpdate: (tileState) => {
        if (
          !tileState.boundAttendeeId ||
          tileState.localTile ||
          tileState.isContent
        ) {
          return;
        }

        const { videoElement, index } = sessionView.acquireVideoElement(
          tileState.tileId
        );
        this.audioVideo.bindVideoElement(tileState.tileId, videoElement);

        // Add remote participant using the model
        participantModel.addRemoteParticipant(tileState.boundAttendeeId, {
          tileId: tileState.tileId,
          externalUserId: tileState.boundExternalUserId,
          index,
        });

        // if the external user ID ends with "_participant", set display name as Agent
        if (
          tileState.boundExternalUserId &&
          tileState.boundExternalUserId.endsWith("_participant")
        ) {
          sessionView.updateRemoteParticipantVideo(index, "Agent", true);
        } else {
          // Otherwise, get the attendee display name from the server
          const engagementId = engagementModel.getEngagementId();
          const attendeeId = tileState.boundAttendeeId;

          sessionController.getAttendeeDisplayName(
            engagementId,
            attendeeId,
            (displayName) => {
              if (displayName) {
                sessionView.updateRemoteParticipantVideo(
                  index,
                  displayName,
                  true
                );
              }
            }
          );
        }
      },
      videoTileWasRemoved: (tileId) => {
        const removedIndex = sessionView.releaseVideoElement(tileId);
        if (removedIndex !== null) {
          // Find and remove the participant from state using the model
          const remoteParticipants = participantModel.getRemoteParticipants();

          let removedAttendeeId = null;
          for (const [attendeeId, participant] of Object.entries(
            remoteParticipants
          )) {
            if (participant.tileId === tileId) {
              removedAttendeeId = attendeeId;
              break;
            }
          }

          if (removedAttendeeId) {
            participantModel.removeRemoteParticipant(removedAttendeeId);
          }
        }
      },
    };

    this.audioVideo.addObserver(observer);
  }

  // Process screen sharing control messages
  handleScreenShareDataMessage(data) {
    try {
      const receivedData = (data && data.json()) || {};
      const { message } = receivedData;

      console.log(
        `[ParticipantService] Received screen share message: ${message}`
      );

      switch (message) {
        case DATA_MESSAGE_TYPES.SCREEN_SHARING_STARTED:
          mediaModel.setScreenShareAllowed(true);
          break;
        case DATA_MESSAGE_TYPES.SCREEN_SHARING_STARTED_VIEW_ONLY:
          break;
        case DATA_MESSAGE_TYPES.SCREEN_SHARING_STOPPED:
          mediaModel.setScreenShareAllowed(false);
          break;
        default:
          console.error(
            `[ParticipantService] Unknown message received: ${message}`
          );
          break;
      }
    } catch (error) {
      console.error(
        "[ParticipantService] Error handling screen share data message:",
        error
      );
    }
  }

  cleanup() {
    // Clean up video element mappings in the view
    sessionView.cleanupVideoElements();

    if (this.audioVideo) {
      this.audioVideo.realtimeUnsubscribeFromReceiveDataMessage(
        SCREEN_SHARING_TOPIC
      );
    }
  }
}

export const participantService = new ParticipantService();
