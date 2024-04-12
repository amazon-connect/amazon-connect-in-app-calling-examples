//
//  CallViewModel.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

class CallViewModel {
    
    var isLocalMuted: Bool {
        get {
            return self.callStateStore.isLocalMuted
        }
        set {
            self.callController.setMute(newValue)
        }
    }

    var isLocalVideoOn: Bool {
        get {
            return self.callStateStore.localVideoTileState != nil
        }
        set {
            if newValue == true {
                self.callController.startLocalVideo()
            } else {
                self.callController.stopLocalVideo()
            }
        }
    }
    
    var isRemoteVideoOn: Bool {
        return self.callStateStore.remoteVideoTileState != nil
    }
    
    var callState: CallState {
        return self.callStateStore.callState
    }
    
    private let callController: CallController
    private let callStateStore: CallStateStore
    private let dtmfSender: DTMFSender
    
    init(callController: CallController,
         dtmfSender: DTMFSender,
         callStateStore: CallStateStore) {
        self.callController = callController
        self.dtmfSender = dtmfSender
        self.callStateStore = callStateStore
    }
    
    func call() {
        self.callController.startCall()
    }
    
    func endCall() {
        self.callController.endCall()
    }
    
    func sendDTMF(_ digits: String, _ onCompletion: @escaping (_ error: Error?) -> Void) {
        self.dtmfSender.sendDTMF(digits) {
            onCompletion(nil)
        } _: { error in
            onCompletion(error)
        }
    }
}
