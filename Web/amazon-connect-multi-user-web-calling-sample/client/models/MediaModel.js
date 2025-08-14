/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

/**
 * MediaModel - Manages audio/video device state and media settings
 */
import { eventBus } from "../services/EventBus.js";
import { MEDIA_EVENTS } from "../services/EventTypes.js";

class MediaModel {
  constructor() {
    // Initialize local state
    this.state = {
      isAudioMuted: false,
      isVideoEnabled: false,
      isScreenShareAllowed: false,
      isScreenSharing: false,
      selectedCamera: null,
      selectedMicrophone: null,
      selectedSpeaker: null,
    };
  }

  getMediaState() {
    return { ...this.state };
  }

  updateMediaState(mediaData) {
    // Update local state
    this.state = {
      ...this.state,
      ...mediaData,
    };

    // Emit events for each changed property
    Object.keys(mediaData).forEach((key) => {
      switch (key) {
        case "isAudioMuted":
          eventBus.publish(
            MEDIA_EVENTS.AUDIO_MUTE_CHANGED,
            this.state.isAudioMuted
          );
          break;
        case "isVideoEnabled":
          eventBus.publish(
            MEDIA_EVENTS.VIDEO_ENABLED_CHANGED,
            this.state.isVideoEnabled
          );
          break;
        case "isScreenSharing":
          eventBus.publish(
            MEDIA_EVENTS.SCREEN_SHARING_CHANGED,
            this.state.isScreenSharing
          );
          break;
        case "isScreenShareAllowed":
          eventBus.publish(
            MEDIA_EVENTS.SCREEN_SHARE_ALLOW_CHANGED,
            this.state.isScreenShareAllowed
          );
          break;
        case "selectedCamera":
          eventBus.publish(
            MEDIA_EVENTS.SELECTED_CAMERA_CHANGED,
            this.state.selectedCamera
          );
          break;
        case "selectedMicrophone":
          eventBus.publish(
            MEDIA_EVENTS.SELECTED_MICROPHONE_CHANGED,
            this.state.selectedMicrophone
          );
          break;
        case "selectedSpeaker":
          eventBus.publish(
            MEDIA_EVENTS.SELECTED_SPEAKER_CHANGED,
            this.state.selectedSpeaker
          );
          break;
      }
    });
  }

  setAudioMuted(isMuted) {
    this.updateMediaState({
      isAudioMuted: isMuted,
    });
  }

  setVideoEnabled(isEnabled) {
    this.updateMediaState({
      isVideoEnabled: isEnabled,
    });
  }

  setScreenSharing(isSharing) {
    this.updateMediaState({
      isScreenSharing: isSharing,
    });
  }

  setScreenShareAllowed(isAllowed) {
    this.updateMediaState({
      isScreenShareAllowed: isAllowed,
    });
  }

  setSelectedCamera(deviceId) {
    this.updateMediaState({
      selectedCamera: deviceId,
    });
  }

  setSelectedMicrophone(deviceId) {
    this.updateMediaState({
      selectedMicrophone: deviceId,
    });
  }

  setSelectedSpeaker(deviceId) {
    this.updateMediaState({
      selectedSpeaker: deviceId,
    });
  }

  isAudioMuted() {
    return this.getMediaState().isAudioMuted;
  }

  isVideoEnabled() {
    return this.getMediaState().isVideoEnabled;
  }

  isScreenSharing() {
    return this.getMediaState().isScreenSharing;
  }

  isScreenShareAllowed() {
    return this.getMediaState().isScreenShareAllowed;
  }

  getSelectedCamera() {
    return this.getMediaState().selectedCamera;
  }

  getSelectedMicrophone() {
    return this.getMediaState().selectedMicrophone;
  }

  getSelectedSpeaker() {
    return this.getMediaState().selectedSpeaker;
  }
}

export const mediaModel = new MediaModel();
