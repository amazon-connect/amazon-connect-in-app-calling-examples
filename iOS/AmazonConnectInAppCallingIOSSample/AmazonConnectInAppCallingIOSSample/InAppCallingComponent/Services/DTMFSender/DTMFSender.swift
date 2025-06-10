//
//  DefaultDTMFSender.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

class DTMFSender {

    private let apiClient: ApiClient
    private let callStateStore: CallStateStore
    private let parcitipantConnectionCredentialsProvider: ParcitipantConnectionCredentialsProvider

    init(apiClient: ApiClient,
         callStateStore: CallStateStore,
         parcitipantConnectionCredentialsProvider: ParcitipantConnectionCredentialsProvider) {
        self.apiClient = apiClient
        self.callStateStore = callStateStore
        self.parcitipantConnectionCredentialsProvider = parcitipantConnectionCredentialsProvider
    }

    func sendDTMF(_ digits: String,
                  _ onSuccess: @escaping() -> Void,
                  _ onFailure: @escaping(_ error: Error) -> Void) {
        guard let participantToken = self.callStateStore.participantToken else {
            onFailure(Errors.missingParticipantToken)
            return
        }
        self.parcitipantConnectionCredentialsProvider.getCredentials(
            participantToken: participantToken) { credentials in

                self.apiClient.sendMessage(connectionToken: credentials,
                                           digits: digits) {
                    onSuccess()
                } onFailure: { error in
                    onFailure(error)
                }

        } onFailure: { error in
            onFailure(error)
        }
    }
}
