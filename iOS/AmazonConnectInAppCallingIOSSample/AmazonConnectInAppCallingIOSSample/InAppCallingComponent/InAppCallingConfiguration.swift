//
//  InAppCallConfiguration.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation
import AmazonChimeSDK

public class InAppCallingConfiguration {

    let connectInstanceId: String
    let contactFlowId: String
    let displayName: String
    let attributes: [String: String]

    let startWebrtcContactEndpoint: String
    let createParticipantConnectionEndpoint: String
    let sendMessageEndpoint: String

    let isCallKitEnabled: Bool

    public init(connectInstanceId: String,
                contactFlowId: String,
                displayName: String,
                attributes: [String: String],
                startWebrtcContactEndpoint: String,
                createParticipantConnectionEndpoint: String,
                sendMessageEndpoint: String,
                isCallKitEnabled: Bool) {
        self.connectInstanceId = connectInstanceId
        self.contactFlowId = contactFlowId
        self.displayName = displayName
        self.attributes = attributes
        self.startWebrtcContactEndpoint = startWebrtcContactEndpoint
        self.createParticipantConnectionEndpoint = createParticipantConnectionEndpoint
        self.sendMessageEndpoint = sendMessageEndpoint
        self.isCallKitEnabled = isCallKitEnabled
    }

}
