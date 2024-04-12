//
//  ServiceProvider.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation
import AmazonChimeSDK

class ServiceProvider {
    
    let callController: CallController
    let callStateStore: CallStateStore
    let callManager: CallManager
    let dtmfSender: DTMFSender
    let callNtfCenter = CallNotificationCenter()
    
    private let apiClient: ApiClient
    private let httpClient = HttpClient()
    private let deviceHelper = DeviceHelper()
    private let parcitipantConnectionCredentialsProvider: ParcitipantConnectionCredentialsProvider
    
    init(_ config: InAppCallingConfiguration) {
        self.callStateStore = CallStateStore(self.callNtfCenter)

        self.apiClient = ApiClient(config: config, httpClient: self.httpClient)
        
        self.parcitipantConnectionCredentialsProvider = ParcitipantConnectionCredentialsProvider(apiClient: self.apiClient)
        
        self.callManager = CallManager(config,
                                       self.apiClient,
                                       callStateStore: self.callStateStore,
                                       self.deviceHelper)
        
        if config.isCallKitEnabled {
            let callKitConfig = CallKitConfiguration(title: "Demo", icon: nil)
            let callKitManager = CallKitManager(callKitConfig, callManager, callStateStore)
            self.callController = CallKitCallController(callKitConfig, callManager, callKitManager, callStateStore, callNtfCenter)
        } else {
            self.callController = DefaultCallController(callManager)
        }
        
        self.dtmfSender = DTMFSender(apiClient: self.apiClient,
                                     callStateStore: self.callStateStore,
                                     parcitipantConnectionCredentialsProvider: self.parcitipantConnectionCredentialsProvider)
    }
}
