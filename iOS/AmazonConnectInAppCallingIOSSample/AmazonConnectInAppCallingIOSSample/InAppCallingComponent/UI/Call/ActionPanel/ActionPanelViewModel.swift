//
//  ActionPanelViewModel.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

class ActionPanelViewModel {
    
    var isLocalMuted: Bool {
        get {
            return self.callStateStore.isLocalMuted
        }
        set {
            self.callManager.setMute(newValue)
        }
    }
    
    var isLocalVideoOn: Bool {
        get {
            return self.callStateStore.localVideoTileState != nil
        }
        set {
            if newValue == true {
                self.callManager.startLocalVideo()
            } else {
                self.callManager.stopLocalVideo()
            }
        }
    }
    
    var isRemoteVideoOn: Bool {
        return self.callStateStore.remoteVideoTileState != nil
    }
    
    var isScreenShareCapabilityEnabled: Bool {
        return self.callStateStore.isScreenShareCapabilityEnabled
    }
    
    var screenShareStatus: ScreenShareStatus {
        return self.callStateStore.screenShareStatus
    }
    
    private let callManager: CallManager
    private let callStateStore: CallStateStore
    
    init(callManager: CallManager,
         callStateStore: CallStateStore) {
        self.callManager = callManager
        self.callStateStore = callStateStore
    }
}
