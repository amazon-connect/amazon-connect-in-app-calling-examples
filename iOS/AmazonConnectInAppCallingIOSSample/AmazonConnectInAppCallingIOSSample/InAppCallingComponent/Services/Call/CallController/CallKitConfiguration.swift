//
//  CallKitConfig.swift
//  AmazonConnectInAppCallingIOSSample
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

class CallKitConfiguration: NSObject {

    /// The call recipient title such as a username, numeric ID, or URL
    let title: String

    /// The PNG data for the icon image to be displayed on CallKit view
    let icon: Data?

    public init(title: String, icon: Data?) {
        self.title = title
        self.icon = icon
    }
}
