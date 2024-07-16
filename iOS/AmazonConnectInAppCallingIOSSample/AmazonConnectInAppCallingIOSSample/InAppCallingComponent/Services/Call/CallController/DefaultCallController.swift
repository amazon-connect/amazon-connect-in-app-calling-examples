//
//  DefaultCallController.swift
//  AmazonConnectInAppCallingIOSSample
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation
import AmazonChimeSDK

class DefaultCallController: CallController {
    
    private let callManager: CallManager
    
    init(callManager: CallManager) {
        self.callManager = callManager
    }
    
    func startCall() {
        self.callManager.startCall(isCallKitEnabled: false)
    }
    
    func endCall() {
        self.callManager.endCall()
    }
    
    func setMute(_ isMuted: Bool) {
        self.callManager.setMute(isMuted)
    }
    
    func startLocalVideo() {
        self.callManager.startLocalVideo()
    }
    
    func stopLocalVideo() {
        self.callManager.stopLocalVideo()
    }
    
    func startScreenShare() {
        self.callManager.startScreenShare()
    }
    
    func stopScreenShare() {
        self.callManager.stopScreenShare()
    }
}
