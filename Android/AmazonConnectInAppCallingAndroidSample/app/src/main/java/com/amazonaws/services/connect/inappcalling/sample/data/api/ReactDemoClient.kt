package com.amazonaws.services.connect.inappcalling.sample.data.api

import com.amazonaws.services.chime.sdk.meetings.internal.utils.HttpUtils
import com.amazonaws.services.chime.sdk.meetings.utils.logger.ConsoleLogger
import com.amazonaws.services.connect.inappcalling.sample.data.utils.Result
import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.net.URL
import java.util.Date

data class JoinMeetingResponse(
    @SerializedName("JoinInfo") val joinInfo: ConnectionData,
)
class ReactDemoClient: ApiClient {
    private val logger = ConsoleLogger()
    private val tag = "ApiClient"

    override suspend fun createWebrtcContact(request: CreateWebrtcContactRequest)
            : Result<CreateWebrtcContactResponse> = withContext(Dispatchers.IO) {
        logger.info(tag, "createWebrtcContact with request: $request")
        val errorMsg = "Failed to createWebrtcContact for request $request, due to: "

        try {
            val url = "https://4w5z5lp6f3.execute-api.us-east-1.amazonaws.com/Prod/join"
            val payload = mutableMapOf(
                "attendeeName" to "george",
                "title" to "screenshare16",
                "region" to "us-west-2"
            )
            val res = HttpUtils.post(
                url = URL(url),
                body = Gson().toJson(payload),
                logger = logger
            )
            logger.info(tag, "response: ${res.data}")
            val joinInfo = Gson().fromJson(res.data!!, JoinMeetingResponse::class.java)
            val response = CreateWebrtcContactResponse(joinInfo.joinInfo, "", "" ,"")
            Result.Success(response)
        } catch (e: Exception) {
            logger.error(tag, errorMsg + e.message)
            Result.Failure(Error(errorMsg + e.message))
        }
    }

    override suspend fun createParticipantConnection(participantToken: String)
            : Result<CreateParticipantConnectionResponse> = withContext(Dispatchers.IO) {
        logger.info(tag, "createParticipantConnection with participantToken: $participantToken")
        val response = CreateParticipantConnectionResponse(ConnectionCredentials("", Date()))
        Result.Success(response)
    }

    override suspend fun sendMessage(
        connectionToken: String,
        digits: String
    ): Result<Unit> = withContext(Dispatchers.IO) {
        logger.info(tag, "sendMessage with digits: $digits")
        Result.Success(Unit)
    }
}