/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import {
  ConsoleLogger,
  DefaultDeviceController,
  LogLevel,
} from "amazon-chime-sdk-js";
import { mediaModel } from "../models/MediaModel.js";

/**
 * MediaService handles all audio/video device management and operations
 */
class MediaService {
  constructor() {
    this.logger = new ConsoleLogger("MediaLogger", LogLevel.OFF);
    this.deviceController = new DefaultDeviceController(this.logger);
    this.audioVideo = null;
  }

  initialize(audioVideo) {
    this.audioVideo = audioVideo;
  }

  async listVideoDevices() {
    return await this.deviceController.listVideoInputDevices();
  }

  async listAudioInputDevices() {
    return await this.deviceController.listAudioInputDevices();
  }

  async listAudioOutputDevices() {
    return await this.deviceController.listAudioOutputDevices();
  }

  // Configure default audio/video devices and initialize them
  async selectDefaultDevices() {
    const videoDevices = await this.listVideoDevices();
    const audioInputDevices = await this.listAudioInputDevices();
    const audioOutputDevices = await this.listAudioOutputDevices();

    const selectedCamera =
      videoDevices.length > 0 ? videoDevices[0].deviceId : null;
    const selectedMicrophone =
      audioInputDevices.length > 0 ? audioInputDevices[0].deviceId : null;
    const selectedSpeaker =
      audioOutputDevices.length > 0 ? audioOutputDevices[0].deviceId : null;

    // Update state with selected devices using the model
    mediaModel.setSelectedCamera(selectedCamera);
    mediaModel.setSelectedMicrophone(selectedMicrophone);
    mediaModel.setSelectedSpeaker(selectedSpeaker);

    // Start audio input if available
    if (selectedMicrophone && this.audioVideo) {
      await this.audioVideo.startAudioInput(selectedMicrophone);
    }

    // Choose audio output if available
    if (selectedSpeaker && this.audioVideo) {
      await this.audioVideo.chooseAudioOutput(selectedSpeaker);
    }

    return { selectedCamera, selectedMicrophone, selectedSpeaker };
  }

  toggleMute() {
    if (!this.audioVideo) return;

    const isMuted = this.audioVideo.realtimeIsLocalAudioMuted();
    if (isMuted) {
      this.audioVideo.realtimeUnmuteLocalAudio();
    } else {
      this.audioVideo.realtimeMuteLocalAudio();
    }
    mediaModel.setAudioMuted(!isMuted);
  }

  async toggleVideo() {
    if (!this.audioVideo) return;

    const isVideoEnabled = mediaModel.isVideoEnabled();
    const selectedCamera = mediaModel.getSelectedCamera();

    if (isVideoEnabled) {
      this.audioVideo.stopLocalVideoTile();
    } else {
      await this.audioVideo.startVideoInput(selectedCamera);
      this.audioVideo.startLocalVideoTile();
    }
    mediaModel.setVideoEnabled(!isVideoEnabled);
  }

  async toggleScreenShare() {
    if (!this.audioVideo) return;

    const isScreenSharing = mediaModel.isScreenSharing();

    if (isScreenSharing) {
      await this.audioVideo.stopContentShare();
    } else {
      await this.audioVideo.startContentShareFromScreenCapture();
    }
  }

  bindAudioElement(audioElement) {
    if (this.audioVideo) {
      this.audioVideo.bindAudioElement(audioElement);
    }
  }

  cleanup() {
    if (this.audioVideo) {
      if (mediaModel.isVideoEnabled()) {
        this.audioVideo.stopLocalVideoTile();
      }
      if (mediaModel.isScreenSharing()) {
        this.audioVideo.stopContentShare();
      }
    }
  }
}
export const mediaService = new MediaService();
