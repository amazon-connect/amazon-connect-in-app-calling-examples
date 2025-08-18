/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

/**
 * EventTypes - Constants for event names used in the EventBus
 * Centralizing event names helps prevent typos and makes refactoring easier
 */

// Media events
export const MEDIA_EVENTS = {
  AUDIO_MUTE_CHANGED: 'media:audioMuteChanged',
  VIDEO_ENABLED_CHANGED: 'media:videoEnabledChanged',
  SCREEN_SHARING_CHANGED: 'media:screenSharingChanged',
  SCREEN_SHARE_ALLOW_CHANGED: 'media:screenShareAllowChanged',
  SELECTED_CAMERA_CHANGED: 'media:selectedCameraChanged',
  SELECTED_MICROPHONE_CHANGED: 'media:selectedMicrophoneChanged',
  SELECTED_SPEAKER_CHANGED: 'media:selectedSpeakerChanged',
};

// Participant events
export const PARTICIPANT_EVENTS = {
  LOCAL_PARTICIPANT_UPDATED: 'participant:localParticipantUpdated',
  REMOTE_PARTICIPANT_ADDED: 'participant:remoteParticipantAdded',
  REMOTE_PARTICIPANT_REMOVED: 'participant:remoteParticipantRemoved',
  SCREEN_SHARER_UPDATED: 'participant:screenSharerUpdated',
};

// Engagement events
export const ENGAGEMENT_EVENTS = {
  MEETING_INFO_UPDATED: 'engagement:meetingInfoUpdated',
  ENGAGEMENT_ID_UPDATED: 'engagement:engagementIdUpdated',
  PARTICIPANT_ID_UPDATED: 'engagement:participantIdUpdated',
  ACTIVE_STATE_CHANGED: 'engagement:activeStateChanged',
};


// Application events
export const APP_EVENTS = {
  STATE_RESET: 'app:stateReset',
};
