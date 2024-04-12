//
//  ApiClient.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

class ApiClient {
    
    private let config: InAppCallingConfiguration
    private let httpClient: HttpClient
    
    init(config: InAppCallingConfiguration,
         httpClient: HttpClient) {
        self.config = config
        self.httpClient = httpClient
    }
    
    func createWebrtcContact(connectInstanceId: String, 
                             contactFlowId: String,
                             displayName: String,
                             attributes: [String: String],
                             onSuccess: @escaping (_ response: CreateWebrtcContactResponse) -> Void,
                             onFailure: @escaping (_ error: Error) -> Void) {
        let url = self.config.startWebrtcContactEndpoint
        let body = CreateWebrtcContactRequest(connectInstanceId: connectInstanceId,
                                              contactFlowId: contactFlowId,
                                              displayName: displayName,
                                              attributes: attributes)
        self.httpClient.postJson(url, nil, body) { data in
            onSuccess(data)
        } _: { error in
            onFailure(error)
        }
    }
    
    func createParticipantConnection(participantToken: String, 
                                     onSuccess: @escaping (_ response: CreateParticipantConnectionResponse) -> Void,
                                     onFailure: @escaping (_ error: Error) -> Void) {
        let url = self.config.createParticipantConnectionEndpoint
        let body = ["ParticipantToken": participantToken]
        self.httpClient.postJson(url, nil, body) { data in
            onSuccess(data)
        } _: { error in
            onFailure(error)
        }
    }
    
    func sendMessage(connectionToken: String, 
                     digits: String,
                     onSuccess: @escaping () -> Void,
                     onFailure: @escaping (_ error: Error) -> Void) {
        let url = self.config.sendMessageEndpoint
        let body = [
            "ConnectionToken": connectionToken,
            "Digits": digits
        ]
        self.httpClient.postJson(url, nil, body) {
            onSuccess()
        } _: { error in
            onFailure(error)
        }
    }
}
