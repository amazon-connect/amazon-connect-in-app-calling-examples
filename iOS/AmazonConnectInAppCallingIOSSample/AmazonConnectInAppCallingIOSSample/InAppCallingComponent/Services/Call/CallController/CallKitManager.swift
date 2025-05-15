//
//  CallKitManager.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation
import CallKit
import AVFAudio

class CallKitManager: NSObject {

    private let callManager: CallManager
    private let callStateStore: CallStateStore
    private let callKitProvider: CXProvider
    private(set) var callUUID = UUID()

    init(_ callKitConfig: CallKitConfiguration,
         _ callManager: CallManager,
         _ callStateStore: CallStateStore) {
        let providerConfig = Self.createCXProviderConfig(callKitConfig.icon)
        self.callKitProvider = CXProvider(configuration: providerConfig)
        self.callManager = callManager
        self.callStateStore = callStateStore

        super.init()

        self.callKitProvider.setDelegate(self, queue: nil)
    }

    func refreshUUID() {
        self.callUUID = UUID()
    }

    func reportOutgoingCall(connectedAt: Date) {
        self.callKitProvider.reportOutgoingCall(with: self.callUUID,
                                                connectedAt: connectedAt)
    }

    func reportCall(endedAt: Date, reason: CXCallEndedReason) {
        self.callKitProvider.reportCall(with: self.callUUID,
                                        endedAt: endedAt,
                                        reason: reason)
    }

    private static func createCXProviderConfig(_ icon: Data?) -> CXProviderConfiguration {
        let createConfig: () -> CXProviderConfiguration = {
            if #available(iOS 14.0, *) {
                return CXProviderConfiguration()
            } else {
                return CXProviderConfiguration(localizedName: "Amazon Connect Sample")
            }
        }
        let config = createConfig()
        config.maximumCallGroups = 1
        config.maximumCallsPerCallGroup = 1
        config.supportsVideo = true
        config.supportedHandleTypes = [.generic]
        config.iconTemplateImageData = icon
        return config
    }

}

extension CallKitManager: CXProviderDelegate {

    func providerDidReset(_ provider: CXProvider) {
        if self.callStateStore.callState == .calling || self.callStateStore.callState == .inCall {
            self.callManager.endCall()
        }
    }

    func provider(_ provider: CXProvider, perform action: CXStartCallAction) {
        let update = CXCallUpdate()
        update.supportsDTMF = false
        update.supportsHolding = false
        provider.reportCall(with: self.callUUID, updated: update)
        self.callKitProvider.reportOutgoingCall(with: self.callUUID,
                                                startedConnectingAt: Date())
        action.fulfill()
    }

    func provider(_ provider: CXProvider, perform action: CXEndCallAction) {
        if self.callStateStore.callState == .calling || self.callStateStore.callState == .inCall {
            self.callManager.endCall()
        }
        action.fulfill()
    }

    func provider(_ provider: CXProvider, perform action: CXSetMutedCallAction) {
        self.callManager.setMute(action.isMuted)
        action.fulfill()
    }

    func provider(_ provider: CXProvider, didActivate audioSession: AVAudioSession) {
        self.callManager.startCall(isCallKitEnabled: true)
    }
}
