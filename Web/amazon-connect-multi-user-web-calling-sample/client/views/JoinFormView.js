/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

/**
 * JoinFormView - Manages join/create form UI elements and interactions
 */
class JoinFormView {
  constructor() {
    // Form elements
    this.engagementIdInput = document.getElementById("engagement-id");
    this.displayNameInput = document.getElementById("display-name");
    this.videoCapabilityCheckbox = document.getElementById("video-capability");
    this.screenshareCapabilityCheckbox = document.getElementById(
      "screenshare-capability"
    );

    // Buttons
    this.createEngagementButton = document.getElementById(
      "create-engagement-button"
    );
    this.joinEngagementButton = document.getElementById(
      "join-engagement-button"
    );

    // Headers
    this.joinEngagementHeader = document.getElementById(
      "join-engagement-header"
    );
    this.createEngagementHeader = document.getElementById(
      "create-engagement-header"
    );

    this.bannerElement = document.getElementById("banner");

    this.loadingIconElement = document.getElementById("loading-icon");
  }

  // Set up event listeners for form buttons
  initialize(engagementHandler) {
    // Add event listeners
    if (this.createEngagementButton) {
      this.createEngagementButton.addEventListener("click", engagementHandler);
    }
    if (this.joinEngagementButton) {
      this.joinEngagementButton.addEventListener("click", engagementHandler);
    }
  }

  // Collect all form input values
  getFormValues() {
    const values = {
      displayName: this.displayNameInput?.value || "",
      engagementId: this.engagementIdInput?.value || "",
      isVideoCapabilitySet: this.videoCapabilityCheckbox?.checked ?? true,
      isScreenshareCapabilitySet:
        this.screenshareCapabilityCheckbox?.checked ?? true,
    };
    return values;
  }

  // Display notification banner with message
  showBanner(message, type = 'info') {
    if (this.bannerElement) {
      this.bannerElement.textContent = message;
      this.bannerElement.style.display = "block";
      
      // Apply different styling based on type
      if (type === 'info') {
        this.bannerElement.className = 'info-message';
      } else {
        this.bannerElement.className = 'error-message';
      }
    }
    this.hideLoading();
  }

  hideBanner() {
    if (this.bannerElement) {
      this.bannerElement.style.display = "none";
    }
  }

  showLoading() {
    if (this.loadingIconElement) {
      this.loadingIconElement.style.display = "block";
    }
    this.hideBanner();
  }

  hideLoading() {
    if (this.loadingIconElement) {
      this.loadingIconElement.style.display = "none";
    }
  }

  // Display the create engagement view
  showCreateView() {
    // Hide join elements
    if (this.joinEngagementHeader) {
      this.joinEngagementHeader.style.display = "none";
    }
    if (this.joinEngagementButton) {
      this.joinEngagementButton.style.display = "none";
    }

    // Show create elements
    if (this.createEngagementHeader) {
      this.createEngagementHeader.style.display = "block";
    }
    if (this.createEngagementButton) {
      this.createEngagementButton.style.display = "inline-block";
    }

    // Show the join form container
    this.showJoinFormContainer();
  }

  // Display the join engagement view
  showJoinView() {
    // Show join elements
    if (this.joinEngagementHeader) {
      this.joinEngagementHeader.style.display = "block";
    }
    if (this.joinEngagementButton) {
      this.joinEngagementButton.style.display = "inline-block";
    }

    // Hide create elements
    if (this.createEngagementHeader) {
      this.createEngagementHeader.style.display = "none";
    }
    if (this.createEngagementButton) {
      this.createEngagementButton.style.display = "none";
    }

    // Show the join form container
    this.showJoinFormContainer();
  }

  showJoinFormContainer() {
    const joinForm = document.getElementById("join-view-container");
    if (joinForm) {
      joinForm.style.display = "block";
    }
  }

  hideJoinFormContainer() {
    const joinForm = document.getElementById("join-view-container");
    if (joinForm) {
      joinForm.style.display = "none";
    }
  }

  setEngagementId(engagementId, disabled = false) {
    if (this.engagementIdInput) {
      this.engagementIdInput.value = engagementId;
      this.engagementIdInput.disabled = disabled;
    }
  }

  setDisplayName(displayName, disabled = false) {
    if (this.displayNameInput) {
      this.displayNameInput.value = displayName;
      this.displayNameInput.disabled = disabled;
    }
  }
}

export const joinFormView = new JoinFormView();
