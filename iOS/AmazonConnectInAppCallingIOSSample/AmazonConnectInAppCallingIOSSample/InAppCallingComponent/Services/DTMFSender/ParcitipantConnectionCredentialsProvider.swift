//
//  ParcitipantConnectionCredentialsProvider.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

class ParcitipantConnectionCredentialsProvider {
    
    private var credentials: String?
    private var expiry: Date?
    
    private let apiClient: ApiClient
    
    init(apiClient: ApiClient) {
        self.apiClient = apiClient
    }
    
    func getCredentials(participantToken: String,
                        onSuccess: @escaping (_ credentials: String) -> Void,
                        onFailure: @escaping (_ error: Error) -> Void) {
        if let credentials = self.credentials, 
            let expiry = self.expiry,
            expiry < Date() {
            onSuccess(credentials)
            return
        }
           
        self.apiClient.createParticipantConnection(participantToken: participantToken) { response in
            self.credentials = response.connectionCredentials.connectionToken
            // self.expiry = response.connectionCredentials.expiry
            
            onSuccess(response.connectionCredentials.connectionToken)
        } onFailure: { error in
            onFailure(error)
        }
    }
}
