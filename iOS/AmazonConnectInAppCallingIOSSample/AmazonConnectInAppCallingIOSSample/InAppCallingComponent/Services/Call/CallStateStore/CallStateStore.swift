//
//  DefaultCallStateStore.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation
import AmazonChimeSDK

enum ScreenShareStatus {
    case local  //End user is sharing screen
    case remote // Agent is sharing screen
    case none   // No one is sharing screen
}

class CallStateStore {

    var callState: CallState = .notStarted {
        didSet {
            guard callState != oldValue else {
                return
            }
            if callState == .notStarted {
                self.clear()
            }
            self.callNtfCenter.notifyCallStateUpdate(oldValue, callState)
        }
    }

    var callError: Error? {
        didSet {
            guard let error = callError else {
                return
            }
            self.callNtfCenter.notifyCallErrorOccur(error)
        }
    }

    var message: String? {
        didSet {
            self.callNtfCenter.notifyMessageUpdate(message)
        }
    }

    var localAttendeeId: String?

    // [AttendeeId: IsMuted]
    private var muteStates = [String: Bool]() {
        didSet {
            guard muteStates != oldValue else {
                return
            }
            self.callNtfCenter.notifyMuteStateUpdate(muteStates)
        }
    }

    var isLocalMuted: Bool {
        get {
            guard let localAttendeeId = self.localAttendeeId else {
                return false
            }
            return self.muteStates[localAttendeeId] ?? false
        } set {
            guard let localAttendeeId = self.localAttendeeId else {
                return
            }
            self.muteStates[localAttendeeId] = newValue
        }
    }

    var localVideoTileState: VideoTileState? {
        return self.videoTileStates[.local]
    }

    var remoteVideoTileState: VideoTileState? {
        return self.videoTileStates[.remote]
    }

    // For tracking remote screen share tile state
    var screenShareTileState: VideoTileState? {
        return self.videoTileStates[.contentShare]
    }

    var bgBlurState: BackgroundBlurState?

    var isVoiceFocusEnabled: Bool = false

    var participantToken: String?

    // True when agent enable screen share session
    var isScreenShareCapabilityEnabled: Bool = false {
        didSet {
            self.callNtfCenter.notifyScreenShareCapabilityUpdate(isScreenShareCapabilityEnabled)
        }
    }

    var screenShareStatus: ScreenShareStatus = .none {
        didSet {
            guard screenShareStatus != oldValue else {
                return
            }
            self.callNtfCenter.notifyScreenShareStatusUpdate(screenShareStatus)
        }
    }

    private(set) var videoTileStates = [VideoTileStateType: VideoTileState]()

    private let callNtfCenter: CallNotificationCenter

    init(_ callNtfCenter: CallNotificationCenter) {
        self.callNtfCenter = callNtfCenter
    }

    func addVideoTile(_ tileState: VideoTileState) {
        let tileStateType = VideoTileStateType(tileState)
        self.videoTileStates[tileStateType] = tileState
        self.callNtfCenter.notifyVideoTileStateDidAdd()
    }

    func removeVideoTile(_ tileState: VideoTileState) {
        let tileStateType = VideoTileStateType(tileState)
        self.videoTileStates.removeValue(forKey: tileStateType)
        self.callNtfCenter.notifyVideoTileStateDidRemove()
    }

    func clearVideoTile() {
        for (_, tileState) in self.videoTileStates {
            self.removeVideoTile(tileState)
        }
    }

    func setMuteState(attendeeId: String, isMuted: Bool) {
        self.muteStates[attendeeId] = isMuted
    }

    private func clear() {
        self.callState = .notStarted
        self.localAttendeeId = nil
        self.muteStates.removeAll()
        self.clearVideoTile()
        self.callError = nil
        self.bgBlurState = nil
        self.isVoiceFocusEnabled = false
        self.participantToken = nil
        self.isScreenShareCapabilityEnabled = false
        self.screenShareStatus = .none
    }
}
