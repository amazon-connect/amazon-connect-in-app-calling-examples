//
//  CallKitCallController.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation
import CallKit

class CallKitCallController: CallController {
    
    private let callManager: CallManager
    private let callKitManager: CallKitManager
    private let callStateStore: CallStateStore
    private let config: CallKitConfiguration
    
    private let callKitController = CXCallController()
    
    init(_ config: CallKitConfiguration,
         _ callManager: CallManager,
         _ callKitManager: CallKitManager,
         _ callStateStore: CallStateStore,
         _ callNtfCenter: CallNotificationCenter) {
        self.config = config
        self.callManager = callManager
        self.callKitManager = callKitManager
        self.callStateStore = callStateStore
        
        callNtfCenter.addObserver(self)
    }
    
    func startCall() {
        self.callKitManager.refreshUUID()
        
        let handle = CXHandle(type: .generic, value: self.config.title)
        let startCallAction = CXStartCallAction(call: self.callKitManager.callUUID, handle: handle)
        let transaction = CXTransaction(action: startCallAction)
        self.callKitController.request(transaction) { error in
            if let error = error {
                self.callStateStore.callError = Errors.failedToStartCall
            }
        }

    }
    
    func cancelCall() {
        self.endCall()
    }
    
    func endCall() {
        let endCallAction = CXEndCallAction(call: self.callKitManager.callUUID)
        let transaction = CXTransaction(action: endCallAction)
        self.callKitController.request(transaction, completion: { _ in
        })
    }
    
    func setMute(_ isMuted: Bool) {
        let muteAction = CXSetMutedCallAction(call: self.callKitManager.callUUID, muted: isMuted)
        let transaction = CXTransaction(action: muteAction)
        self.callKitController.request(transaction) { error in
            if let error = error {
                let callError = isMuted ? Errors.muteLocalAudioFailed : Errors.unmuteLocalAudioFailed
                self.callStateStore.callError = callError
            }
        }
    }
    
    func startLocalVideo() {
        self.callManager.startLocalVideo()
    }
    
    func stopLocalVideo() {
        self.callManager.stopLocalVideo()
    }
}

extension CallKitCallController: CallObserver {
    func callStateDidUpdate(_ oldState: CallState, _ newState: CallState) {
        if oldState == .calling && newState == .inCall {
            self.callKitManager.reportOutgoingCall(connectedAt: Date())
        } else if newState == .notStarted {
            self.callKitManager.reportCall(endedAt: Date(),
                                           reason: .remoteEnded)
        }
    }
    
    func callErrorDidOccur(_ error: Error) {}
    
    func videoTileStateDidAdd() {}
    
    func videoTileStateDidRemove() {}
    
    func muteStateDidUpdate() {}
}
