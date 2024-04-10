//
//  InAppCallingComponent.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation
import AmazonChimeSDK

@objcMembers public class InAppCalling: NSObject {

    static var serviceProvider: ServiceProvider?
    
    public static func configure(_ configuration: InAppCallingConfiguration) {
        self.serviceProvider = ServiceProvider(configuration)
    }
}
