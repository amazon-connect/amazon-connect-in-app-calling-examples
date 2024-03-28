//
//  CreateWebrtcContactRequest.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

struct CreateWebrtcContactRequest: Codable {

    let connectInstanceId: String
    let contactFlowId: String
    let displayName: String
    let attributes: [String: String]
    
    enum CodingKeys: String, CodingKey {
        case connectInstanceId = "ConnectInstanceId"
        case contactFlowId = "ContactFlowId"
        case displayName = "DisplayName"
        case attributes = "Attributes"
    }
}
