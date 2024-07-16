/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample.ui

import android.content.Intent
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.amazonaws.services.chime.sdk.meetings.audiovideo.video.VideoRenderView
import com.amazonaws.services.chime.sdk.meetings.audiovideo.video.VideoTileState
import com.amazonaws.services.chime.sdk.meetings.device.MediaDevice
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallError
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallManager
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallObserver
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallState
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallStateRepository
import com.amazonaws.services.connect.inappcalling.sample.data.domain.Caller
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallerMuteState
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallerVideoState
import com.amazonaws.services.connect.inappcalling.sample.data.domain.screenshare.ScreenShareStatus
import com.amazonaws.services.connect.inappcalling.sample.data.utils.Transient
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class CallSheetViewModel(
    private val callManager: CallManager,
    private val callStateRepository: CallStateRepository
) : ViewModel(), CallObserver {

    init {
        callStateRepository.addCallObserver(observer = this)
    }

    private val _error = MutableLiveData<Transient<CallError>>()
    val error: LiveData<Transient<CallError>> = _error

    private val _callState = MutableLiveData(callStateRepository.getCallState())
    val callState: LiveData<CallState> = _callState

    private val _localCallerMuted = MutableLiveData(callStateRepository.isLocalCallerMuted())
    val localCallerMuted: LiveData<Boolean> = _localCallerMuted

    private val _activeDevice = MutableLiveData(callStateRepository.getActiveAudioDevice())
    val activeDevice: LiveData<MediaDevice?> = _activeDevice

    private val _localVideoState = MutableLiveData(
        callStateRepository.getCallerVideoStates().firstOrNull() { it.caller.isLocal }
            ?: CallerVideoState(Caller(true), false)
    )
    val localVideoState: LiveData<CallerVideoState> = _localVideoState

    private val _remoteVideoState = MutableLiveData(
        callStateRepository.getCallerVideoStates().firstOrNull { !it.caller.isLocal }
            ?: CallerVideoState(Caller(false), false)
    )
    val remoteVideoState = _remoteVideoState

    private val _screenShareCapabilityEnabled = MutableLiveData(callStateRepository.isScreenShareCapabilityEnabled())
    val screenShareCapabilityEnabled: LiveData<Boolean> = _screenShareCapabilityEnabled

    private val _screenShareStatus = MutableLiveData(callStateRepository.getScreenShareStatus())
    val screenShareStatus: LiveData<ScreenShareStatus> = _screenShareStatus

    private val _screenShareTileState = MutableLiveData(callStateRepository.getScreenShareTileState())
    val screenShareTileState: LiveData<VideoTileState?> = _screenShareTileState

    fun startCall() {
        // Starting call in a different thread not tie to the UI
        // prevents this long lasting operation gets
        // killed when the sheet is minimized / dismissed in middle
        CoroutineScope(Dispatchers.Default).launch {
            callManager.startCall()
        }
    }

    fun endCall() {
        viewModelScope.launch {
            callManager.endCall()
        }
    }

    fun toggleMute() {
        viewModelScope.launch {
            if (localCallerMuted.value == false) {
                callManager.muteLocalAudio()
            } else {
               callManager.unmuteLocalAudio()
            }
        }
    }

    fun toggleLocalVideo() {
        viewModelScope.launch {
            if (localVideoState.value?.on == true) {
                callManager.stopLocalVideo()
            } else {
                callManager.startLocalVideo()
            }
        }
    }

    fun isLocalVideoOn(): Boolean = localVideoState.value?.on == true

    fun isRemoteVideoOn(): Boolean = remoteVideoState.value?.on == true

    fun bindVideoView(videoRenderView: VideoRenderView, isLocal: Boolean) {
        viewModelScope.launch {
            val tileId =
                if (isLocal) localVideoState.value?.tileId else remoteVideoState.value?.tileId
            tileId?.let { callManager.bindVideoView(videoRenderView, it) }
        }
    }

    fun unbindVideoView(isLocal: Boolean) {
        viewModelScope.launch {
            val tileId =
                if (isLocal) localVideoState.value?.tileId else remoteVideoState.value?.tileId
            tileId?.let {
                callManager.unbindVideoView(it)
            }
        }
    }

    fun bindVideoView(viewRenderView: VideoRenderView, tileId: Int) {
        viewModelScope.launch {
            callManager.bindVideoView(viewRenderView, tileId)
        }
    }

    fun unbindVideoView(tileId: Int) {
        viewModelScope.launch {
            callManager.unbindVideoView(tileId)
        }
    }

    fun switchCamera() {
        viewModelScope.launch {
            callManager.switchCamera()
        }
    }

    fun isUsingFrontCamera(): Boolean {
        var res = false
        viewModelScope.launch {
            res = callManager.isUsingFrontCamera()
        }
        return res
    }

    fun chooseAudioDevice(mediaDevice: MediaDevice) {
        viewModelScope.launch {
            callManager.chooseAudioDevice(mediaDevice)
            _activeDevice.postValue(mediaDevice)
        }
    }

    fun listAudioDevices(): List<MediaDevice> {
        var res: List<MediaDevice> = emptyList()
        viewModelScope.launch {
            res = callManager.listAudioDevices()
        }
        return res
    }

    fun getActiveAudioDevice(): MediaDevice? {
        var res: MediaDevice ? = null
        viewModelScope.launch {
            res = callManager.getActiveDevice()
        }
        return res
    }

    fun startScreenShare(resultCode: Int, data: Intent) {
        viewModelScope.launch {
            callManager.startScreenShare(resultCode, data)
        }
    }

    fun stopScreenShare() {
        viewModelScope.launch {
            callManager.stopScreenShare()
        }
    }

    override fun onCallStateChanged(state: CallState) {

        if (state == CallState.IN_CALL) {
            viewModelScope.launch {
                callManager.listAudioDevices()
                callStateRepository.getActiveAudioDevice()
                    ?.let { callManager.chooseAudioDevice(it) }
            }
        }

        _callState.postValue(state)
    }

    override fun onError(error: CallError) {
        _error.postValue(Transient(error))
    }

    override fun onCallerMuteStateChanged(state: CallerMuteState) {
        if (state.caller.isLocal) {
            _localCallerMuted.postValue(state.muted)
        }
    }

    override fun onActiveAudioDeviceChanged(device: MediaDevice) {
        _activeDevice.postValue(device)
    }

    override fun onCallerVideoStateChanged(state: CallerVideoState) {
        if (state.caller.isLocal) {
            _localVideoState.postValue(state)
        } else {
            _remoteVideoState.postValue(state)
        }
    }

    override fun onScreenShareCapabilityChanged(enabled: Boolean) {
        _screenShareCapabilityEnabled.postValue(enabled)
    }

    override fun onScreenShareStatusChanged(status: ScreenShareStatus) {
        _screenShareStatus.postValue(status)
    }

    override fun onScreenShareTileStateChanged(tileStates: VideoTileState?) {
        _screenShareTileState.postValue(tileStates)
    }

    fun bindLocalScreenShareView(videoRenderView: VideoRenderView) {
        viewModelScope.launch {
            callManager.bindLocalScreenShareView(videoRenderView)
        }
    }

    fun unbindLocalScreenShareView(videoRenderView: VideoRenderView) {
        viewModelScope.launch {
            callManager.unbindLocalScreenShareView(videoRenderView)
        }
    }
}