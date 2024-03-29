/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample.data.domain


import com.amazonaws.services.chime.sdk.meetings.device.MediaDevice
import com.amazonaws.services.chime.sdk.meetings.internal.utils.ConcurrentSet
import com.amazonaws.services.chime.sdk.meetings.utils.logger.ConsoleLogger
import java.lang.ref.WeakReference

class CallStateRepository {
    private val logger = ConsoleLogger()
    private val tag = "CallStateRepository"
    private val observers = ConcurrentSet.createConcurrentSet<WeakReference<CallObserver>>()
    private var state = CallState.NOT_STARTED
    private var localAttendeeId: String? = null
    private var activeAudioDevice: MediaDevice? = null
    private var participantToken: String? = null
    private var voiceFocusEnabled: Boolean = false
    private var backgroundBlurState: BackgroundBlurState = BackgroundBlurState.OFF
    private val callerMuteStates = mutableMapOf<Caller, CallerMuteState>()
    private val callerVideoStates = mutableMapOf<Caller, CallerVideoState>()

    fun addCallObserver(observer: CallObserver) {
        observers.add(WeakReference(observer))
    }

    fun removeCallObserver(observer: CallObserver) {
        val toBeRemoved = observers.filter { observer === it.get() }
        toBeRemoved.forEach { observers.remove(it) }
    }

    fun getCallState(): CallState = state

    fun updateCallState(newState: CallState) {
        logger.info(tag, "Updating call state from: $state to $newState")
        if (state == newState) return

        state = newState
        observers.forEach { it.get()?.onCallStateChanged(state) }

        if (newState == CallState.NOT_STARTED) reset()
    }

    fun notifyError(error: CallError) {
        observers.forEach { it.get()?.onError(error) }
    }

    fun getLocalAttendeeId(): String? = localAttendeeId

    fun setLocalAttendeeId(attendeeId: String) {
        this.localAttendeeId = attendeeId
    }

    fun getParticipantToken(): String? = participantToken

    fun setParticipantToken(participantToken: String) {
        this.participantToken = participantToken
    }

    fun isLocalCallerMuted(): Boolean {
        return callerMuteStates.values.find { it.caller.isLocal }?.muted ?: false
    }


    fun updateCallerMuteState(callerMuteState: CallerMuteState) {
        callerMuteStates[callerMuteState.caller] = callerMuteState
        observers.forEach { it.get()?.onCallerMuteStateChanged(callerMuteState) }
    }

    fun updateAvailableAudioDevices(devices: List<MediaDevice>) {
        observers.forEach { it.get()?.onAudioDevicesChanged(devices) }
    }

    fun getActiveAudioDevice(): MediaDevice? {
        return activeAudioDevice
    }

    fun updateActiveAudioDevice(device: MediaDevice) {
        if (activeAudioDevice == device) return
        activeAudioDevice = device
        observers.forEach { it.get()?.onActiveAudioDeviceChanged(device) }
    }

    fun getCallerVideoStates(): List<CallerVideoState> = callerVideoStates.values.toList()

    fun updateCallerVideoState(callerVideoState: CallerVideoState) {
        callerVideoStates[callerVideoState.caller] = callerVideoState
        observers.forEach { it.get()?.onCallerVideoStateChanged(callerVideoState) }
    }

    fun isVoiceFocusEnabled(): Boolean = voiceFocusEnabled

    fun setVoiceFocusEnabled(enabled: Boolean) {
        voiceFocusEnabled = enabled
    }


    fun updateBackgroundBlurState(state: BackgroundBlurState) {
        backgroundBlurState = state
    }
    fun getBackgroundBlurState(): BackgroundBlurState = backgroundBlurState

    private fun reset() {
        state = CallState.NOT_STARTED
        localAttendeeId = null
        participantToken = null
        callerMuteStates.clear()
        activeAudioDevice = null
        voiceFocusEnabled = false
        backgroundBlurState = BackgroundBlurState.OFF
        callerVideoStates.clear()
    }
}
