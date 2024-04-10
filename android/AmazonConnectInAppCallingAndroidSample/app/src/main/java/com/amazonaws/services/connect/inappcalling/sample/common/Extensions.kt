/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample.common

import android.content.Context
import android.telecom.CallAudioState
import android.telecom.CallAudioState.ROUTE_BLUETOOTH
import android.telecom.CallAudioState.ROUTE_EARPIECE
import android.telecom.CallAudioState.ROUTE_SPEAKER
import android.telecom.CallAudioState.ROUTE_WIRED_HEADSET
import android.telecom.CallAudioState.audioRouteToString
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.amazonaws.services.chime.sdk.meetings.device.MediaDevice
import com.amazonaws.services.chime.sdk.meetings.device.MediaDeviceType
import com.amazonaws.services.chime.sdk.meetings.session.MeetingSessionConfiguration
import com.amazonaws.services.chime.sdk.meetings.session.MeetingSessionCredentials
import com.amazonaws.services.chime.sdk.meetings.session.MeetingSessionURLs
import com.amazonaws.services.chime.sdk.meetings.session.defaultUrlRewriter
import com.amazonaws.services.connect.inappcalling.sample.R
import com.amazonaws.services.connect.inappcalling.sample.data.api.CreateWebrtcContactResponse
import com.google.android.material.dialog.MaterialAlertDialogBuilder

fun AppCompatActivity.showToast(msg: String) {
    Toast.makeText(applicationContext, msg, Toast.LENGTH_LONG).show()
}

fun Context.showGeneralErrorAlert(message: String?) {
    MaterialAlertDialogBuilder(this)
        .setTitle(R.string.error_title)
        .setMessage(message)
        .setPositiveButton(R.string.error_neutral_button_text) { dialog, _ ->
            dialog.dismiss()
    }.show()
}

internal fun View.gone() {
    visibility = View.GONE
}
internal fun View.visible() {
    visibility = View.VISIBLE
}

fun convertToMeetingSessionConfiguration(response: CreateWebrtcContactResponse) : MeetingSessionConfiguration {
    return MeetingSessionConfiguration(
        meetingId = response.connectionData.meeting.meetingId,
        credentials = MeetingSessionCredentials(
            attendeeId = response.connectionData.attendee.attendeeId,
            externalUserId = "",
            joinToken = response.connectionData.attendee.joinToken
        ),
        urls = MeetingSessionURLs(
            _audioFallbackURL = response.connectionData.meeting.mediaPlacement.audioFallbackUrl,
            _audioHostURL = response.connectionData.meeting.mediaPlacement.audioHostUrl,
            _turnControlURL = response.connectionData.meeting.mediaPlacement.turnControlUrl,
            _ingestionURL = response.connectionData.meeting.mediaPlacement.eventIngestionUrl,
            _signalingURL = response.connectionData.meeting.mediaPlacement.signalingUrl,
            urlRewriter = ::defaultUrlRewriter
        )
    )
}

fun MediaDevice.displayName(): String =
    when(this.type) {
        MediaDeviceType.AUDIO_HANDSET -> "Handset"
        MediaDeviceType.AUDIO_BUILTIN_SPEAKER -> "Speaker"
        MediaDeviceType.AUDIO_USB_HEADSET, MediaDeviceType.AUDIO_WIRED_HEADSET -> "Headphones"
        MediaDeviceType.AUDIO_BLUETOOTH -> "Bluetooth"
        else -> "Unknown"
    }

fun getAudioRoute(from: MediaDevice): Int? =
    when (from.type) {
        MediaDeviceType.AUDIO_HANDSET -> ROUTE_EARPIECE
        MediaDeviceType.AUDIO_BLUETOOTH -> ROUTE_BLUETOOTH
        MediaDeviceType.AUDIO_WIRED_HEADSET, MediaDeviceType.AUDIO_USB_HEADSET -> ROUTE_WIRED_HEADSET
        MediaDeviceType.AUDIO_BUILTIN_SPEAKER -> ROUTE_SPEAKER
        else -> null
    }

fun getMediaDevice(from: CallAudioState): MediaDevice {
    val type = when (from.route) {
        ROUTE_EARPIECE -> MediaDeviceType.AUDIO_HANDSET
        ROUTE_BLUETOOTH -> MediaDeviceType.AUDIO_BLUETOOTH
        ROUTE_WIRED_HEADSET -> MediaDeviceType.AUDIO_WIRED_HEADSET
        ROUTE_SPEAKER -> MediaDeviceType.AUDIO_BUILTIN_SPEAKER
        else -> MediaDeviceType.OTHER
    }
    return MediaDevice(audioRouteToString(from.route), type)
}
