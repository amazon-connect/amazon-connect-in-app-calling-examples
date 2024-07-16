/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample.data.domain

import com.amazonaws.services.chime.sdk.meetings.audiovideo.video.VideoTileState
import com.amazonaws.services.chime.sdk.meetings.device.MediaDevice
import com.amazonaws.services.connect.inappcalling.sample.data.domain.screenshare.ScreenShareDataMessageType
import com.amazonaws.services.connect.inappcalling.sample.data.domain.screenshare.ScreenShareStatus

enum class CallState { NOT_STARTED, CALLING, IN_CALL, RECONNECTING }

data class Caller(val isLocal: Boolean)

data class CallerMuteState(val caller: Caller, val muted: Boolean)

data class CallerVideoState(val caller: Caller, val on: Boolean, val tileId: Int? = null)

enum class BackgroundBlurState(val strength: Float) {
    LOW(10f),
    MEDIUM(15f),
    HIGH(25f),
    OFF(0f)
}

interface CallObserver {
    fun onCallStateChanged(state: CallState) {}

    fun onError(error: CallError) {}

    fun onCallerMuteStateChanged(state: CallerMuteState) {}

    fun onAudioDevicesChanged(devices: List<MediaDevice>) {}

    fun onActiveAudioDeviceChanged(device: MediaDevice) {}

    fun onCallerVideoStateChanged(state: CallerVideoState) {}

    fun onScreenShareCapabilityChanged(enabled: Boolean) {}

    fun onScreenShareStatusChanged(status: ScreenShareStatus) {}

    fun onScreenShareTileStateChanged(tileState: VideoTileState?) {}
}

enum class CallError(val message: String) {
    CALL_SESSION_ABORTED("Something went wrong, please try again."),
    FAIL_TO_GET_AUDIO_PERMISSION("Microphone permission denied. Please enable microphone permission in Settings and try again."),
    FAIL_TO_GET_VIDEO_PERMISSION("Camera permission denied. Please enable camera permission in Settings and try again."),
    FAIL_TO_START_CALL("Unable to make call. Please try again in a few minutes."),
    FAIL_TO_SEND_DTMF("Failed to send DTMF"),
    FAIL_TO_CHANGE_VOICE_FOCUS("Failed to change Voice Focus."),
}
