/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample.data.utils

import com.amazonaws.services.connect.inappcalling.sample.data.api.ApiClient
import com.amazonaws.services.connect.inappcalling.sample.data.api.ConnectionCredentials
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.lang.Error
import java.util.Date

class ConnectionTokenProvider(private val apiClient: ApiClient) {
    private var cachedCredentials: ConnectionCredentials? = null

    suspend fun getConnectionToken(participantToken: String)
    : Result<String> {
        var res: Result<String> = Result.Failure(Error("Failed to get connect token"))
        if (cachedCredentials == null || cachedCredentials?.expiry?.before(Date()) == true) {
            val token = refreshToken(participantToken)
            cachedCredentials = token
        }
        cachedCredentials?.let {
            res = Result.Success(it.connectionToken)
        }
        return res
    }

    private suspend fun refreshToken(participantToken: String)
    : ConnectionCredentials? = withContext(Dispatchers.IO) {
        var res: ConnectionCredentials? = null
        apiClient.createParticipantConnection(
            participantToken = participantToken
        ).onSuccess {
            res = it.connectionCredentials
        }
        res
    }
}
