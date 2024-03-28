//
//  CreateParticipantConnectionResponse.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

struct CreateParticipantConnectionResponse: Codable {

    let connectionCredentials: ConnectionCredentials
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        connectionCredentials = try container.decode(ConnectionCredentials.self, forKey: .connectionCredentials)
    }
    
    enum CodingKeys: String, CodingKey {
        case connectionCredentials = "ConnectionCredentials"
    }
}

struct ConnectionCredentials: Codable {

    let connectionToken: String
    let expiry: Date
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        connectionToken = try container.decode(String.self, forKey: .connectionToken)
        expiry = try container.decode(Date.self, forKey: .expiry)
    }
    
    enum CodingKeys: String, CodingKey {
        case connectionToken = "ConnectionToken"
        case expiry = "Expiry"
    }
}
