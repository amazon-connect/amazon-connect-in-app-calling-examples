/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

/**
 * SessionService - Creates and manages Amazon Chime SDK meeting sessions
 */
import {
  ConsoleLogger,
  DefaultMeetingSession,
  LogLevel,
  MeetingSessionConfiguration,
} from "amazon-chime-sdk-js";
import { engagementModel } from "../models/EngagementModel.js";
import { mediaModel } from "../models/MediaModel.js";
import { mediaService } from "./MediaService.js";
import { participantService } from "./ParticipantService.js";
import { viewManager, VIEW_TYPE } from "../managers/ViewManager.js";
class SessionService {
  constructor() {
    this.logger = new ConsoleLogger("SessionLogger", LogLevel.OFF);
    this.meetingSession = null;
  }

  // Create and configure the meeting session with provided meeting info
  async initialize(meetingInfo) {
    if (!meetingInfo || !meetingInfo.Meeting || !meetingInfo.Attendee) {
      throw new Error("[Session Service] Invalid meeting information");
    }

    // Create meeting session configuration
    const configuration = new MeetingSessionConfiguration(
      meetingInfo.Meeting,
      meetingInfo.Attendee
    );

    // Create meeting session
    this.meetingSession = new DefaultMeetingSession(
      configuration,
      this.logger,
      mediaService.deviceController
    );

    // Initialize services with the meeting session's audioVideo controller
    mediaService.initialize(this.meetingSession.audioVideo);
    participantService.initialize(this.meetingSession.audioVideo);

    // Add observer for audio/video events
    const observer = {
      audioVideoDidStart: () => {
        viewManager.switchToView(VIEW_TYPE.ENGAGEMENT);
        console.log("[Session Service] audioVideoDidStart");
      },
      audioVideoDidStop: (sessionStatus) => {
        console.log(
          "[Session Service] Session stopped with a status code: ",
          sessionStatus.statusCode()
        );
        window.location.href = window.location.origin;
      },
      audioVideoDidStartConnecting: (reconnecting) => {
        if (reconnecting) {
          // e.g. the WiFi connection is dropped.
          console.log("[Session Service] Attempting to reconnect");
        }
      },
    };

    this.meetingSession.audioVideo.addObserver(observer);

    // Select default devices
    await mediaService.selectDefaultDevices();

    // Update state with meeting info using the model
    engagementModel.setActive(true);

    console.log("[Session Service] initialized");
  }

  // Start the audio/video session
  async start() {
    if (!this.meetingSession) {
      throw new Error("[Session Service] Meeting session not initialized");
    }

    await this.meetingSession.audioVideo.start();
    console.log("[Session Service] Meeting session started");
  }

  // Configure video and audio elements for the session
  setupVideoElements(localVideoElement, screenShareElement, audioElement) {
    if (!this.meetingSession) {
      throw new Error("[Session Service] Meeting session not initialized");
    }

    // Set up local video
    if (localVideoElement) {
      participantService.subscribeToLocalVideo(localVideoElement);
    }

    // Set up screen share
    if (screenShareElement) {
      participantService.subscribeToScreenShare(screenShareElement);
    }

    // Set up remote videos
    participantService.subscribeToRemoteVideos();

    // Set up audio
    if (audioElement) {
      mediaService.bindAudioElement(audioElement);
    }
  }

  // End the session and clean up resources
  leave() {
    if (!this.meetingSession) {
      return;
    }

    console.log("[SessionService] Leaving meeting");

    // Clean up services
    mediaService.cleanup();
    participantService.cleanup();

    // Stop the meeting session
    this.meetingSession.audioVideo.stop();
    this.meetingSession = null;

    // Update state using models
    engagementModel.setActive(false);

    // Reset media state
    mediaModel.setAudioMuted(false);
    mediaModel.setVideoEnabled(false);
    mediaModel.setScreenSharing(false);
  }

  isActive() {
    return this.meetingSession !== null;
  }
}

export const sessionService = new SessionService();
