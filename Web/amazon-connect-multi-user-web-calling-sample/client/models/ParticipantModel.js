/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

/**
 * ParticipantModel - Manages local and remote participant information
 */

class ParticipantModel {
  constructor() {
    // Initialize local state
    this.state = {
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
    };
  }

  getParticipantsState() {
    return { ...this.state };
  }

  updateParticipantsState(participantData) {
    // Update local state with deep merge
    if (participantData.local) {
      this.state.local = {
        ...this.state.local,
        ...participantData.local,
      };
    }

    if (participantData.remote) {
      this.state.remote = {
        ...this.state.remote,
        ...participantData.remote,
      };
    }

    if (participantData.screenSharer) {
      this.state.screenSharer = {
        ...this.state.screenSharer,
        ...participantData.screenSharer,
      };

    }
  }

  setLocalParticipant(displayName, participantId, participantToken, tileId) {
    this.updateParticipantsState({
      local: {
        displayName,
        participantId,
        participantToken: participantToken || "",
        tileId: tileId || "",
      },
    });
  }

  addRemoteParticipant(participantId, participantData) {
    const currentParticipants = this.getParticipantsState();
    const updatedRemote = {
      ...currentParticipants.remote,
      [participantId]: participantData,
    };

    this.updateParticipantsState({
      remote: updatedRemote,
    });

  }

  removeRemoteParticipant(participantId) {
    const currentParticipants = this.getParticipantsState();
    const updatedRemote = { ...currentParticipants.remote };
    delete updatedRemote[participantId];

    this.updateParticipantsState({
      remote: updatedRemote,
    });
  }

  setScreenSharer(tileId, attendeeId, externalUserId) {
    this.updateParticipantsState({
      screenSharer: {
        tileId,
        attendeeId,
        externalUserId,
      },
    });
  }

  clearScreenSharer() {
    this.updateParticipantsState({
      screenSharer: {
        tileId: "",
        attendeeId: "",
        externalUserId: "",
      },
    });
  }

  getLocalParticipant() {
    return this.getParticipantsState().local;
  }

  getRemoteParticipants() {
    return this.getParticipantsState().remote;
  }

  getScreenSharer() {
    return this.getParticipantsState().screenSharer;
  }
}

export const participantModel = new ParticipantModel();
