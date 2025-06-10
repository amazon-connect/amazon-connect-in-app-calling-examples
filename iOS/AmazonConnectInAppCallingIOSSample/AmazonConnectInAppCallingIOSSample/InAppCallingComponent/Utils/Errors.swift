//
//  Errors.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

enum Errors: Error, LocalizedError, CustomStringConvertible {

    case audioPermissionDenied
    case unknownAudioPermission
    case cameraPermissionDenied
    case unknownCameraPermission
    case createMeetingSessionFailed
    case startMeetingSessionFailed
    case callSessionAborted
    case missingParticipantToken
    case failedToStartCall
    case muteLocalAudioFailed
    case unmuteLocalAudioFailed

    public var description: String {
        switch self {
        case .audioPermissionDenied, .unknownAudioPermission:
            return "Microphone permission denied. Please enable microphone permission in Settings and try again."
        case .cameraPermissionDenied, .unknownCameraPermission:
            return "Camera permission denied. Please enable camera permission in Settings and try again."
        case .createMeetingSessionFailed, .startMeetingSessionFailed:
            return "Unable to make call. Please try again in a few minutes."
        case .callSessionAborted:
            return "Something went wrong, please try again."
        case .missingParticipantToken:
            return "Failed to send DTMF, participant token is missing."
        case .failedToStartCall:
            return "Failed to start call"
        case .muteLocalAudioFailed:
            return "Mute local audio failed"
        case .unmuteLocalAudioFailed:
            return "Unmute local audio failed"
        }
    }

    public var errorDescription: String? {
        return self.description
    }
}
