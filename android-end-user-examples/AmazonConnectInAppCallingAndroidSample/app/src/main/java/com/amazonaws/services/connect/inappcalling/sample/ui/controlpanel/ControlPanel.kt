/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample.ui.controlpanel

import android.view.View
import com.amazonaws.services.chime.sdk.meetings.device.MediaDevice
import com.amazonaws.services.chime.sdk.meetings.device.MediaDeviceType
import com.amazonaws.services.connect.inappcalling.sample.R
import com.amazonaws.services.connect.inappcalling.sample.databinding.CallSheetControlPanelBinding
import com.amazonaws.services.connect.inappcalling.sample.common.displayName

class ControlPanel(
    private val muteButton: ControlButton,
    private val keypadButton: ControlButton,
    private val deviceButton: ControlButton,
    private val videoButton: ControlButton,
    private val preferencesButton: ControlButton
) {
    constructor(
        binding: CallSheetControlPanelBinding
    ) : this(
        muteButton = binding.muteButton,
        keypadButton = binding.keypadButton,
        deviceButton = binding.deviceButton,
        videoButton = binding.videoButton,
        preferencesButton = binding.preferencesButton
    )

    fun initMuteButton(onClick: (View) -> Unit) {
        muteButton.setButtonOnClickListener { onClick.invoke(it) }
    }

    fun updateMuteButton(toMuted: Boolean) {
        if (toMuted) {
            muteButton.setButtonImage(R.drawable.ic_microphone_muted)
            muteButton.setButtonBackgroundColor(R.color.control_button_bg_gray)
            muteButton.setButtonContentDescription(R.string.call_sheet_muted_button_description)
            muteButton.setDescriptionText(R.string.call_sheet_muted_button_description)
        } else {
            muteButton.setButtonImage(R.drawable.ic_microphone_unmuted)
            muteButton.setButtonBackgroundColor(R.color.control_button_bg_highlighted)
            muteButton.setButtonContentDescription(R.string.call_sheet_unmuted_button_description)
            muteButton.setDescriptionText(R.string.call_sheet_unmuted_button_description)
        }
    }

    fun initKeypadButton(onClick: (View) -> Unit) {
        keypadButton.setButtonOnClickListener { onClick.invoke(it) }
        keypadButton.setButtonImage(R.drawable.ic_keypad)
        keypadButton.setButtonBackgroundColor(R.color.control_button_bg_gray)
        keypadButton.setButtonContentDescription(R.string.call_sheet_keypad_button_description)
        keypadButton.setDescriptionText(R.string.call_sheet_keypad_button_description)
    }

    fun initVideoButton(onClick: (View) -> Unit) {
        videoButton.setButtonOnClickListener { onClick.invoke(it) }
        updateVideoButton(false)
    }

    fun updateVideoButton(toStarted: Boolean) {
        if (toStarted) {
            videoButton.setButtonBackgroundColor(R.color.control_button_bg_highlighted)
            videoButton.setButtonImage(R.drawable.ic_camera_on)
            videoButton.setButtonContentDescription(R.string.call_sheet_video_button_on_description)
            videoButton.setDescriptionText(R.string.call_sheet_video_button_on_description)
        } else {
            videoButton.setButtonBackgroundColor(R.color.control_button_bg_gray)
            videoButton.setButtonImage(R.drawable.ic_camera_off)
            videoButton.setButtonContentDescription(R.string.call_sheet_video_button_off_description)
            videoButton.setDescriptionText(R.string.call_sheet_video_button_off_description)
        }
    }

    fun initDeviceButton(onClick: (View) -> Unit) {
        deviceButton.setButtonOnClickListener { onClick.invoke(it) }
    }
    fun updateDeviceButton(toDevice: MediaDevice) {
        val iconResourceId = when (toDevice.type) {
            MediaDeviceType.AUDIO_HANDSET -> R.drawable.ic_handset
            MediaDeviceType.AUDIO_BUILTIN_SPEAKER -> R.drawable.ic_speaker
            MediaDeviceType.AUDIO_USB_HEADSET, MediaDeviceType.AUDIO_WIRED_HEADSET -> R.drawable.ic_headset
            MediaDeviceType.AUDIO_BLUETOOTH -> R.drawable.ic_bluetooth_headphone
            else -> R.drawable.ic_speaker
        }
        deviceButton.setButtonImage(iconResourceId)
        deviceButton.setButtonContentDescription(toDevice.displayName())
        deviceButton.setDescriptionText(toDevice.displayName())
        if (toDevice.type == MediaDeviceType.AUDIO_HANDSET) {
            deviceButton.setButtonBackgroundColor(R.color.control_button_bg_gray)
        } else {
            deviceButton.setButtonBackgroundColor(R.color.control_button_bg_highlighted)
        }
    }

    fun initPreferencesButton(onClick: (View) -> Unit) {
        preferencesButton.setButtonOnClickListener { onClick.invoke(it) }
        preferencesButton.setButtonImage(R.drawable.ic_preferences)
        preferencesButton.setButtonBackgroundColor(R.color.control_button_bg_gray)
        preferencesButton.setButtonContentDescription(R.string.call_sheet_preferences_button_description)
        preferencesButton.setDescriptionText(R.string.call_sheet_preferences_button_description)

    }
}
