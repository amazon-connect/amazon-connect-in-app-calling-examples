/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample.data.api

import com.amazonaws.services.chime.sdk.meetings.internal.utils.HttpUtils
import com.amazonaws.services.chime.sdk.meetings.utils.logger.ConsoleLogger
import com.google.gson.Gson
import com.amazonaws.services.connect.inappcalling.sample.data.utils.Result
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.net.URL

data class ApiClientConfig(
    val startWebRTCContactEndpoint: String,
    val createParticipantConnectionEndpoint: String,
    val sendMessageEndpoint: String
)
interface ApiClient {
    suspend fun createWebrtcContact(request: CreateWebrtcContactRequest)
            : Result<CreateWebrtcContactResponse>

    suspend fun createParticipantConnection(participantToken: String)
            : Result<CreateParticipantConnectionResponse>

    suspend fun sendMessage(
        connectionToken: String,
        digits: String
    ): Result<Unit>
}
class DefaultApiClient(private val config: ApiClientConfig) : ApiClient {
    private val logger = ConsoleLogger()
    private val tag = "ApiClient"

    override suspend fun createWebrtcContact(request: CreateWebrtcContactRequest)
    : Result<CreateWebrtcContactResponse>  = withContext(Dispatchers.IO) {
        logger.info(tag, "createWebrtcContact with request: $request")
        val errorMsg = "Failed to createWebrtcContact for request $request, due to: "
        try {
            val url = config.startWebRTCContactEndpoint
            val res = HttpUtils.post(
                url = URL(url),
                body = Gson().toJson(request),
                logger = logger
            )
            logger.info(tag, "response: ${res.data}")
            val response = Gson().fromJson(res.data!!, CreateWebrtcContactResponse::class.java)
            Result.Success(response)
        } catch (e: Exception) {
            logger.error(tag, errorMsg + e.message)
            Result.Failure(Error(errorMsg + e.message))
        }
    }

    override suspend fun createParticipantConnection(participantToken: String)
    : Result<CreateParticipantConnectionResponse> = withContext(Dispatchers.IO) {
        logger.info(tag, "createParticipantConnection with participantToken: $participantToken")
        val errorMsg = "Failed to createParticipantConnection for participantToken $participantToken, due to:"
        try {
            val url = config.createParticipantConnectionEndpoint
            val res = HttpUtils.post(
                url = URL(url),
                body = "{ \"ParticipantToken\": \"$participantToken\"}",
                logger = logger
            )
            logger.info(tag, "response: ${res.data}")
            val response = Gson().fromJson(res.data!!, CreateParticipantConnectionResponse::class.java)
            Result.Success(response)
        } catch (e: Exception) {
            logger.error(tag, errorMsg + e.message)
            Result.Failure(Error(errorMsg + e.message))
        }
    }

    override suspend fun sendMessage(
        connectionToken: String,
        digits: String
    ): Result<Unit>  = withContext(Dispatchers.IO) {
        logger.info(tag, "sendMessage with digits: $digits")
        val errorMsg = "Failed to sendMessage for digits: $digits, connectionToken: $connectionToken, due to: "
        try {
            val url = config.sendMessageEndpoint
            val res = HttpUtils.post(
                url = URL(url),
                body = "{ \"ConnectionToken\": \"$connectionToken\", \"Digits\": \"$digits\"}",
                logger = logger
            )
            logger.info(tag, "response: ${res.data}")
            if (res.httpException == null) {
                Result.Success(Unit)
            } else {
                logger.error(tag, errorMsg + res)
                Result.Failure(Error(errorMsg + res))
            }
        } catch (e: Exception) {
            logger.error(tag, errorMsg + e.message)
            Result.Failure(Error(errorMsg + e.message))
        }
    }
}
