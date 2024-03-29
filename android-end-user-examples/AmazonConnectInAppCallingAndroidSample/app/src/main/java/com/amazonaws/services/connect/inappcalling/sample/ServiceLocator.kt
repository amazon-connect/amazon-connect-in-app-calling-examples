/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample

import com.amazonaws.services.connect.inappcalling.sample.data.api.ApiClient
import com.amazonaws.services.connect.inappcalling.sample.data.api.ApiClientConfig
import com.amazonaws.services.connect.inappcalling.sample.data.utils.ConnectionTokenProvider
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallManager
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallStateRepository

class ServiceLocator(private val config: CallConfiguration) {
    val apiClient: ApiClient by lazy {
        ApiClient(
            config = ApiClientConfig(
                startWebRTCContactEndpoint = config.startWebrtcEndpoint,
                createParticipantConnectionEndpoint = config.createParticipantConnectionEndpoint,
                sendMessageEndpoint = config.sendMessageEndpoint
            )
        )
    }

    val connectionTokenProvider: ConnectionTokenProvider by lazy {
        ConnectionTokenProvider(apiClient = apiClient)
    }

    val callStateRepo: CallStateRepository by lazy { CallStateRepository() }

    val callManager: CallManager by lazy {
        CallManager(
            config = config,
            callStateRepository = callStateRepo,
            tokenProvider = connectionTokenProvider,
            apiClient = apiClient
        )
    }
}

interface ServiceLocatorProvider {
    fun getServiceLocator(): ServiceLocator

    fun updateServiceLocator(newServiceLocator: ServiceLocator) {}
}
