/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample.data.api

import com.google.gson.annotations.SerializedName
import java.util.Date

data class CreateWebrtcContactRequest(
    @SerializedName("ConnectInstanceId") val connectInstanceId: String,
    @SerializedName("ContactFlowId") val contactFlowId: String,
    @SerializedName("DisplayName") val displayName: String,
    @SerializedName("Attributes") val attributes: Map<String, String>
)

data class CreateWebrtcContactResponse(
    @SerializedName("ConnectionData") val connectionData: ConnectionData,
    @SerializedName("ContactId") val contactId: String,
    @SerializedName("ParticipantId") val participantId: String,
    @SerializedName("ParticipantToken") val participantToken: String
)

data class ConnectionData(
    @SerializedName("Attendee") val attendee: AttendeeData,
    @SerializedName("Meeting") val meeting: MeetingData
)

data class AttendeeData(
    @SerializedName("JoinToken") val joinToken: String,
    @SerializedName("AttendeeId") val attendeeId: String
)

data class MeetingData(
    @SerializedName("MediaRegion") val mediaRegion: String,
    @SerializedName("MediaPlacement") val mediaPlacement: MediaPlacement,
    @SerializedName("MeetingFeatures") val meetingFeatures: MeetingFeatures,
    @SerializedName("MeetingId") val meetingId: String
)

data class MediaPlacement(
    @SerializedName("AudioFallbackUrl") val audioFallbackUrl: String,
    @SerializedName("AudioHostUrl") val audioHostUrl: String,
    @SerializedName("EventIngestionUrl")  val eventIngestionUrl: String,
    @SerializedName("SignalingUrl") val signalingUrl: String,
    @SerializedName("TurnControlUrl") val turnControlUrl: String
)

data class MeetingFeatures(
    @SerializedName("Audio") val audio: AudioFeatures?
)

data class AudioFeatures(
    @SerializedName("EchoReduction") val echoReduction: String?
)

data class CreateParticipantConnectionResponse(
    @SerializedName("ConnectionCredentials") val connectionCredentials: ConnectionCredentials
)

data class ConnectionCredentials(
    @SerializedName("ConnectionToken") val connectionToken: String,
    @SerializedName("Expiry") val expiry: Date
)
