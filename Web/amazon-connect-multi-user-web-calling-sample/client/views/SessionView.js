/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

/**
 * SessionView - Manages meeting session UI elements and interactions
 */

class SessionView {
  constructor() {
    // Control buttons
    this.muteAudioButton = document.getElementById("mute-button");
    this.enableVideoButton = document.getElementById("video-button");
    this.shareScreenButton = document.getElementById("screen-share-button");
    this.leaveButton = document.getElementById("leave-button");

    // Video elements
    this.localVideoElement = document.getElementById("local-video");
    this.localVideoContainer = document.getElementById("local-video-container");
    this.localParticipantNameElement = document.getElementById(
      "local-participant-name"
    );
    this.screenShareElement = document.getElementById("screen-share-viewer");
    this.screenSharerNameElement =
      document.getElementById("screen-sharer-name");
    this.remoteAudioElement = document.getElementById("remote-audio");

    // Remote video containers
    this.remoteVideoContainers = [];
    this.remoteVideoElements = [];
    this.remoteParticipantNameElements = [];
    this.indexMap = {};
    this.maxRemoteParticipants = 5;

    // Initialize remote video references
    for (let i = 0; i < this.maxRemoteParticipants; i++) {
      this.remoteVideoElements.push(
        document.getElementById(`remote-video-${i}`)
      );
      this.remoteParticipantNameElements.push(
        document.getElementById(`participant-name-${i}`)
      );
    }
  }

  // Set up event listeners for media control buttons
  initialize(
    muteAudioHandler,
    enableVideoHandler,
    shareScreenHandler,
    leaveHandler
  ) {
    // Add event listeners
    if (this.muteAudioButton) {
      this.muteAudioButton.addEventListener("click", muteAudioHandler);
    }

    if (this.enableVideoButton) {
      this.enableVideoButton.addEventListener("click", enableVideoHandler);
    }

    if (this.shareScreenButton) {
      this.shareScreenButton.addEventListener("click", shareScreenHandler);
    }

    if (this.leaveButton) {
      this.leaveButton.addEventListener("click", leaveHandler);
    }
  }

  // Update mute button UI based on audio state
  updateMuteAudioButton(isMuted) {
    if (this.muteAudioButton) {
      // Update icon if present
      const icon = this.muteAudioButton.querySelector("i");
      if (icon) {
        icon.className = `fas ${
          isMuted ? "fa-microphone-slash" : "fa-microphone"
        }`;
      }

      // Update text
      const span = this.muteAudioButton.querySelector("span");
      if (span) {
        span.textContent = isMuted ? "Unmute" : "Mute";
      } else {
        this.muteAudioButton.textContent = isMuted
          ? "Unmute Audio"
          : "Mute Audio";
      }

      // Update button style
      this.muteAudioButton.classList.toggle("active", isMuted);
    }
  }

  // Update video button UI based on camera state
  updateEnableVideoButton(isEnabled) {
    if (this.enableVideoButton) {
      // Update icon if present
      const icon = this.enableVideoButton.querySelector("i");
      if (icon) {
        icon.className = `fas ${isEnabled ? "fa-video-slash" : "fa-video"}`;
      }

      // Update text
      const span = this.enableVideoButton.querySelector("span");
      if (span) {
        span.textContent = isEnabled ? "Stop Video" : "Start Video";
      } else {
        this.enableVideoButton.textContent = isEnabled
          ? "Disable Video"
          : "Enable Video";
      }
      this.enableVideoButton.classList.toggle("active", isEnabled);
      this.localVideoContainer.classList.toggle("active", isEnabled);
    }
  }

  // Update screen share button UI based on sharing state
  updateShareScreenButton(isSharing) {
    if (this.shareScreenButton) {
      // Update icon if present
      const icon = this.shareScreenButton.querySelector("i");
      if (icon) {
        icon.className = `fas ${isSharing ? "fa-stop-circle" : "fa-desktop"}`;
      }

      // Update text
      const span = this.shareScreenButton.querySelector("span");
      if (span) {
        span.textContent = isSharing ? "Stop Share" : "Start Share";
      } else {
        this.shareScreenButton.textContent = isSharing
          ? "Stop Sharing"
          : "Share Screen";
      }

      // Update button style
      this.shareScreenButton.classList.toggle("active", isSharing);
    }
  }

  // Show/hide screen share button based on permissions
  updateShareScreenButtonVisibility(isAllowed) {
    if (this.shareScreenButton) {
      this.shareScreenButton.style.display = isAllowed ? "flex" : "none";
    }
  }

  updateScreenSharerName(name) {
    if (this.screenSharerNameElement) {
      this.screenSharerNameElement.textContent = name;
      this.screenSharerNameElement.style.display = name ? "block" : "none";
    }
  }

  updateLocalParticipantName(name) {
    if (this.localParticipantNameElement && name) {
      this.localParticipantNameElement.textContent = name;
    }
  }

  // Return all video/audio elements for binding
  getVideoElements() {
    return {
      localVideo: this.localVideoElement,
      screenShare: this.screenShareElement,
      remoteAudio: this.remoteAudioElement,
      remoteVideos: this.remoteVideoElements,
      remoteParticipantNames: this.remoteParticipantNameElements,
    };
  }

  // Update remote video container with participant name and active state
  updateRemoteParticipantVideo(index, participantName, isActive) {
    if (index < 0 || index >= this.maxRemoteParticipants) {
      console.error(`[SessionView] Invalid remote video index: ${index}`);
      return;
    }

    const videoContainer =
      this.remoteVideoElements[index]?.closest(".video-container");
    const nameElement = this.remoteParticipantNameElements[index];

    if (videoContainer) {
      videoContainer.classList.toggle("active", isActive);
    }

    if (nameElement) {
      nameElement.textContent = participantName || "";
    }
  }

  // Find or allocate a video element for a participant
  acquireVideoElement(tileId) {
    // Return the same video element if already bound.
    for (let i = 0; i < this.maxRemoteParticipants; i++) {
      if (this.indexMap[i] === tileId) {
        return { videoElement: this.remoteVideoElements[i], index: i };
      }
    }

    // Return the next available video element.
    for (let i = 0; i < this.maxRemoteParticipants; i++) {
      if (!this.indexMap.hasOwnProperty(i)) {
        this.indexMap[i] = tileId;
        const videoElement = this.remoteVideoElements[i];

        // Mark the video container as active (will be populated with participant name later)
        this.updateRemoteParticipantVideo(i, "", true);

        return { videoElement, index: i };
      }
    }

    // If we get here, all slots are full
    return { videoElement: null, index: -1 };
  }

  // Free up a video element when participant leaves
  releaseVideoElement(tileId) {
    for (let i = 0; i < this.maxRemoteParticipants; i++) {
      if (this.indexMap[i] === tileId) {
        // Update UI to show participant has left
        this.updateRemoteParticipantVideo(i, "", false);

        delete this.indexMap[i];
        return i;
      }
    }

    return null;
  }

  // Reset all video elements and mappings
  cleanupVideoElements() {
    this.indexMap = {};

    // Reset UI elements
    for (let i = 0; i < this.maxRemoteParticipants; i++) {
      this.updateRemoteParticipantVideo(i, "", false);
    }
  }

  showSessionView() {
    const sessionView = document.getElementById("session-view-container");
    if (sessionView) {
      sessionView.style.display = "block";
    }
  }

  hideSessionView() {
    const sessionView = document.getElementById("session-view-container");
    if (sessionView) {
      sessionView.style.display = "none";
    }
  }
}

export const sessionView = new SessionView();
