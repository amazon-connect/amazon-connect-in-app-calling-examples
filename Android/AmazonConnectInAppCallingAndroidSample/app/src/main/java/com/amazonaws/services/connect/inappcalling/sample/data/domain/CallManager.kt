/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample.data.domain

import android.Manifest
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.IBinder
import android.telecom.DisconnectCause
import android.telecom.PhoneAccount
import android.telecom.PhoneAccountHandle
import android.telecom.TelecomManager
import android.telecom.VideoProfile
import com.amazonaws.services.chime.sdk.meetings.audiovideo.AttendeeInfo
import com.amazonaws.services.chime.sdk.meetings.audiovideo.AudioVideoObserver
import com.amazonaws.services.chime.sdk.meetings.audiovideo.SignalUpdate
import com.amazonaws.services.chime.sdk.meetings.audiovideo.VolumeUpdate
import com.amazonaws.services.chime.sdk.meetings.audiovideo.video.RemoteVideoSource
import com.amazonaws.services.chime.sdk.meetings.audiovideo.video.VideoRenderView
import com.amazonaws.services.chime.sdk.meetings.audiovideo.video.VideoTileObserver
import com.amazonaws.services.chime.sdk.meetings.audiovideo.video.VideoTileState
import com.amazonaws.services.chime.sdk.meetings.audiovideo.video.backgroundfilter.backgroundblur.BackgroundBlurConfiguration
import com.amazonaws.services.chime.sdk.meetings.audiovideo.video.backgroundfilter.backgroundblur.BackgroundBlurVideoFrameProcessor
import com.amazonaws.services.chime.sdk.meetings.audiovideo.video.capture.CameraCaptureSource
import com.amazonaws.services.chime.sdk.meetings.audiovideo.video.capture.DefaultCameraCaptureSource
import com.amazonaws.services.chime.sdk.meetings.audiovideo.video.capture.DefaultSurfaceTextureCaptureSourceFactory
import com.amazonaws.services.chime.sdk.meetings.audiovideo.video.gl.EglCoreFactory
import com.amazonaws.services.chime.sdk.meetings.audiovideo.video.gl.EglVideoRenderView
import com.amazonaws.services.chime.sdk.meetings.device.DeviceChangeObserver
import com.amazonaws.services.chime.sdk.meetings.device.MediaDevice
import com.amazonaws.services.chime.sdk.meetings.device.MediaDeviceType
import com.amazonaws.services.chime.sdk.meetings.realtime.RealtimeObserver
import com.amazonaws.services.chime.sdk.meetings.realtime.datamessage.DataMessage
import com.amazonaws.services.chime.sdk.meetings.realtime.datamessage.DataMessageObserver
import com.amazonaws.services.chime.sdk.meetings.session.DefaultMeetingSession
import com.amazonaws.services.chime.sdk.meetings.session.MeetingSession
import com.amazonaws.services.chime.sdk.meetings.session.MeetingSessionStatus
import com.amazonaws.services.chime.sdk.meetings.session.MeetingSessionStatusCode
import com.amazonaws.services.chime.sdk.meetings.utils.logger.ConsoleLogger
import com.amazonaws.services.connect.inappcalling.sample.CallConfiguration
import com.amazonaws.services.connect.inappcalling.sample.common.convertToMeetingSessionConfiguration
import com.amazonaws.services.connect.inappcalling.sample.common.getAudioRoute
import com.amazonaws.services.connect.inappcalling.sample.data.api.ApiClient
import com.amazonaws.services.connect.inappcalling.sample.data.api.CreateWebrtcContactRequest
import com.amazonaws.services.connect.inappcalling.sample.data.api.CreateWebrtcContactResponse
import com.amazonaws.services.connect.inappcalling.sample.data.domain.screenshare.AMAZON_CONNECT_SCREEN_SHARING_TOPIC
import com.amazonaws.services.connect.inappcalling.sample.data.domain.screenshare.ScreenShareManager
import com.amazonaws.services.connect.inappcalling.sample.data.domain.screenshare.ScreenShareStatus
import com.amazonaws.services.connect.inappcalling.sample.data.utils.ConnectionTokenProvider
import com.amazonaws.services.connect.inappcalling.sample.data.utils.onSuccess
import com.amazonaws.services.connect.inappcalling.sample.service.CallConnectionService
import com.amazonaws.services.connect.inappcalling.sample.service.MicrophoneService

class CallManager(
    private val config: CallConfiguration,
    private val screenShareManager: ScreenShareManager,
    private val callStateRepository: CallStateRepository,
    private val tokenProvider: ConnectionTokenProvider,
    private val apiClient: ApiClient,
    private val eglCoreFactory: EglCoreFactory
) : AudioVideoObserver, RealtimeObserver, DeviceChangeObserver, VideoTileObserver, DataMessageObserver {
    private val logger = ConsoleLogger()
    private val tag = "CallManager"
    private val telecomManager = config.applicationContext.getSystemService(Context.TELECOM_SERVICE) as TelecomManager
    private val componentName by lazy {
        ComponentName(config.applicationContext, CallConnectionService::class.java)
    }
    private val phoneAccountHandle by lazy {
        PhoneAccountHandle(componentName, config.applicationContext.packageName)
    }

    private var meetingSession: MeetingSession? = null
    private lateinit var cameraCaptureSource: CameraCaptureSource
    private lateinit var backgroundBlurVideoFrameProcessor: BackgroundBlurVideoFrameProcessor
    private var isMicrophoneServiceBound = false
    private var microphoneServiceConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            isMicrophoneServiceBound = true
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            isMicrophoneServiceBound = false
        }
    }

    init {
        registerPhoneAccount()
    }

    /*
     * Call lifecycle management
     */

    suspend fun startCall() {
        if (callStateRepository.getCallState() != CallState.NOT_STARTED) return

        callStateRepository.updateCallState(newState = CallState.CALLING)

        createWebRTCContact()?.let { response ->
            meetingSession = createMeetingSession(createWebrtcContactResponse = response)
            meetingSession?.audioVideo?.start()
            // Add new call to Telecom system
            val extras = Bundle()
            extras.putInt(TelecomManager.EXTRA_START_CALL_WITH_VIDEO_STATE, VideoProfile.STATE_BIDIRECTIONAL)
            extras.putParcelable(TelecomManager.EXTRA_PHONE_ACCOUNT_HANDLE, phoneAccountHandle)
            if (config.applicationContext.checkSelfPermission(Manifest.permission.MANAGE_OWN_CALLS)
                == PackageManager.PERMISSION_GRANTED) {
                telecomManager.placeCall(Uri.parse("sip:dummy"), extras)
            }
            startMicrophoneService()

            // Initialize call data
            callStateRepository.setLocalAttendeeId(attendeeId = response.connectionData.attendee.attendeeId)
            callStateRepository.setParticipantToken(participantToken = response.participantToken)
            callStateRepository.updateCallerMuteState(
                callerMuteState = CallerMuteState(
                    caller = Caller(isLocal = true),
                    muted = false
                )
            )
        } ?: run {
            callStateRepository.notifyError(error = CallError.FAIL_TO_START_CALL)
            callStateRepository.updateCallState(newState = CallState.NOT_STARTED)
            cleanUp()
        }
    }

    private suspend fun createWebRTCContact(): CreateWebrtcContactResponse? {
        var res: CreateWebrtcContactResponse? = null

        apiClient.createWebrtcContact(
            request = CreateWebrtcContactRequest(
                connectInstanceId = config.connectInstanceId,
                contactFlowId = config.contactFlowId,
                displayName = config.displayName,
                attributes = config.attributes
            )
        ).onSuccess { res = it }

        return res
    }

    private fun createMeetingSession(createWebrtcContactResponse: CreateWebrtcContactResponse): MeetingSession {
        // Create meeting session
        val meetingSessionConfig = convertToMeetingSessionConfiguration(response = createWebrtcContactResponse)
        val sdkLogger = ConsoleLogger()
        val surfaceTextureCaptureSourceFactory = DefaultSurfaceTextureCaptureSourceFactory(
            logger = sdkLogger,
            eglCoreFactory = eglCoreFactory
        )
        cameraCaptureSource = DefaultCameraCaptureSource(
            context = config.applicationContext,
            logger = sdkLogger,
            surfaceTextureCaptureSourceFactory = surfaceTextureCaptureSourceFactory
        )
        backgroundBlurVideoFrameProcessor = BackgroundBlurVideoFrameProcessor(
            logger = sdkLogger,
            eglCoreFactory = eglCoreFactory,
            context = config.applicationContext,
            configurations = BackgroundBlurConfiguration()
        )

        val session = DefaultMeetingSession(
            configuration = meetingSessionConfig,
            logger = sdkLogger,
            context = config.applicationContext,
            eglCoreFactory = eglCoreFactory,
        )
        // Subscribe meeting events
        session.audioVideo.addAudioVideoObserver(observer = this)
        session.audioVideo.addRealtimeObserver(observer = this)
        session.audioVideo.addDeviceChangeObserver(observer = this)
        session.audioVideo.addVideoTileObserver(observer = this)
        session.audioVideo.addRealtimeDataMessageObserver(AMAZON_CONNECT_SCREEN_SHARING_TOPIC, observer = this)
        return session
    }

    fun endCall() {
        if (callStateRepository.getCallState() == CallState.NOT_STARTED) return
        stopScreenShare()
        meetingSession?.audioVideo?.stop()
        cleanUp()
    }

    private fun cleanUp() {
        // Unsubscribe meeting events
        meetingSession?.audioVideo?.removeAudioVideoObserver(observer = this)
        meetingSession?.audioVideo?.removeRealtimeObserver(observer = this)
        meetingSession?.audioVideo?.removeDeviceChangeObserver(observer = this)
        meetingSession?.audioVideo?.removeVideoTileObserver(observer = this)
        meetingSession?.audioVideo?.removeRealtimeDataMessageObserverFromTopic(
            AMAZON_CONNECT_SCREEN_SHARING_TOPIC)
        // Disconnect telecom connection
        CallConnectionService.connection?.setDisconnected(DisconnectCause(DisconnectCause.LOCAL))
        CallConnectionService.connection?.destroy()
        // Disconnect microphone service
        if (isMicrophoneServiceBound) {
            config.applicationContext.unbindService(microphoneServiceConnection)
            isMicrophoneServiceBound = false
        }

        callStateRepository.updateCallState(newState = CallState.NOT_STARTED)
    }

    /*
     * DTMF
     */

    suspend fun sendDTMF(digits: String): Boolean {
        var res = false
        callStateRepository.getParticipantToken()?.let {
            tokenProvider.getConnectionToken(
                participantToken = it
            ).onSuccess { token ->
                apiClient
                    .sendMessage(connectionToken = token, digits = digits)
                    .onSuccess { res = true }
            }
        }

        return res
    }

    /*
     * Audio
     */

    fun muteLocalAudio() {
        meetingSession?.audioVideo?.realtimeLocalMute()
    }

    fun unmuteLocalAudio() {
        meetingSession?.audioVideo?.realtimeLocalUnmute()
    }

    fun getActiveDevice(): MediaDevice? {
        return  if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            callStateRepository.getActiveAudioDevice()
            } else {
                meetingSession?.audioVideo?.getActiveAudioDevice()
        }
    }

    fun updateActiveDevice(device: MediaDevice) {
        callStateRepository.updateActiveAudioDevice(device)
    }

    fun listAudioDevices(): List<MediaDevice> {
        return meetingSession?.audioVideo?.listAudioDevices() ?: emptyList()
    }

    fun chooseAudioDevice(device: MediaDevice) {
        meetingSession?.audioVideo?.chooseAudioDevice(device)
        // This is because some device (oneplus) restriction on using AudioManager in a call
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getAudioRoute(device)?.let {
                CallConnectionService.connection?.setAudioRoute(it)
            }
        }
    }

    fun setVoiceFocusEnabled(enabled: Boolean): Boolean {
        val res = meetingSession?.audioVideo?.realtimeSetVoiceFocusEnabled(enabled) ?: false
        if (res) {
            callStateRepository.setVoiceFocusEnabled(enabled)
        }
        return res
    }

    /*
     * Video
     */

    fun startLocalVideo() {
        cameraCaptureSource.start()
        meetingSession?.audioVideo?.startLocalVideo(cameraCaptureSource)
    }

    fun bindVideoView(videoRenderView: VideoRenderView, tileId: Int) {
        meetingSession?.audioVideo?.bindVideoView(videoRenderView, tileId)
    }

    fun unbindVideoView(tileId: Int) {
        meetingSession?.audioVideo?.unbindVideoView(tileId)
    }

    fun bindLocalScreenShareView(videoRenderView: VideoRenderView) {
        if (videoRenderView is EglVideoRenderView) {
            videoRenderView.init(eglCoreFactory)
        }
        screenShareManager.addVideoSink(videoRenderView)
    }

    fun unbindLocalScreenShareView(videoRenderView: VideoRenderView) {
        screenShareManager.removeVideoSink(videoRenderView)
    }

    fun switchCamera() {
        cameraCaptureSource.switchCamera()
    }

    fun isUsingFrontCamera() = cameraCaptureSource.device?.type == MediaDeviceType.VIDEO_FRONT_CAMERA

    fun stopLocalVideo() {
        cameraCaptureSource.stop()
        meetingSession?.audioVideo?.stopLocalVideo()
    }

    fun setBackgroundBlur(state: BackgroundBlurState) {
        when (state) {
            BackgroundBlurState.OFF -> {
                cameraCaptureSource.removeVideoSink(backgroundBlurVideoFrameProcessor)
                meetingSession?.audioVideo?.startLocalVideo(cameraCaptureSource)
            }
            else -> {
                backgroundBlurVideoFrameProcessor.configurations = BackgroundBlurConfiguration(state.strength)
                cameraCaptureSource.addVideoSink(backgroundBlurVideoFrameProcessor)
                meetingSession?.audioVideo?.startLocalVideo(backgroundBlurVideoFrameProcessor)
            }
        }
        callStateRepository.updateBackgroundBlurState(state)
    }

    private fun changeCallState(newState: CallState) {
        callStateRepository.updateCallState(newState)
    }

    // Start local screen share
    fun startScreenShare(resultCode: Int, data: Intent) {
        meetingSession?.let {
            screenShareManager.startScreenShare(resultCode, data, it.audioVideo)
        }
    }

    // Stop local screen share
    fun stopScreenShare() {
        if(callStateRepository.getScreenShareStatus() == ScreenShareStatus.LOCAL) {
            screenShareManager.stop()
        }
    }

    /*
     * Meeting events
     */

    // `AudioVideoObserver` implementation
    override fun onAudioSessionDropped() {
        changeCallState(CallState.RECONNECTING)
    }

    override fun onAudioSessionStopped(sessionStatus: MeetingSessionStatus) {
        if (sessionStatus.statusCode != MeetingSessionStatusCode.OK) {
            callStateRepository.notifyError(CallError.CALL_SESSION_ABORTED)
        }
        changeCallState(CallState.NOT_STARTED)
        cleanUp()
    }

    override fun onAudioSessionStarted(reconnecting: Boolean) {
        if (reconnecting) {
            changeCallState(CallState.IN_CALL)
        }
    }

    // `RealtimeObserver` implementation
    override fun onAttendeesJoined(attendeeInfo: Array<AttendeeInfo>) {
        val hasAgent = attendeeInfo.any { it.externalUserId.endsWith("agent") }
        if (hasAgent) {
            changeCallState(CallState.IN_CALL)
            CallConnectionService.connection?.setActive()
            meetingSession?.audioVideo?.startRemoteVideo()
            setVoiceFocusEnabled(true)
        }
    }

    override fun onAttendeesMuted(attendeeInfo: Array<AttendeeInfo>) {
        attendeeInfo.forEach { info ->
            notifyCallerMuteStateChange(CallerMuteState(Caller(isCallerLocal(info)), true))
        }
    }

    override fun onAttendeesUnmuted(attendeeInfo: Array<AttendeeInfo>) {
        attendeeInfo.forEach { info ->
            notifyCallerMuteStateChange(CallerMuteState(Caller(isCallerLocal(info)), false))
        }
    }

    // `DeviceChangedObserver` implementation
    override fun onAudioDeviceChanged(freshAudioDeviceList: List<MediaDevice>) {
        callStateRepository.updateAvailableAudioDevices(
            freshAudioDeviceList
                .filter { it.type != MediaDeviceType.OTHER }
        )
    }

    // `VideoTileObserver` implementation
    override fun onVideoTileAdded(tileState: VideoTileState) {
        if (tileState.isContent) {
            stopScreenShare()
            callStateRepository.updateScreenShareTileState(tileState)
            callStateRepository.updateScreenShareStatus(ScreenShareStatus.REMOTE)
            return
        }

        callStateRepository.updateCallerVideoState(
            CallerVideoState(
                caller = Caller(tileState.isLocalTile),
                on = true,
                tileId = tileState.tileId
            )
        )
    }

    override fun onVideoTileRemoved(tileState: VideoTileState) {
        if(tileState.isContent) {
            callStateRepository.updateScreenShareTileState(null)
            if(callStateRepository.getScreenShareStatus() != ScreenShareStatus.LOCAL) {
                callStateRepository.updateScreenShareStatus(ScreenShareStatus.NONE)
            }
            return
        }
        callStateRepository.updateCallerVideoState(
            CallerVideoState(
                caller = Caller(tileState.isLocalTile),
                on = false,
                tileId = tileState.tileId
            )
        )
    }

    override fun onDataMessageReceived(dataMessage: DataMessage) {
        screenShareManager.handleDataMessage(dataMessage)
    }

    private fun notifyCallerMuteStateChange(state: CallerMuteState) {
        callStateRepository.updateCallerMuteState(state)
    }

    private fun isCallerLocal(attendeeInfo: AttendeeInfo): Boolean =
        callStateRepository.getLocalAttendeeId() == attendeeInfo.attendeeId

    // Unused
    override fun onAudioSessionCancelledReconnect() {}
    override fun onAudioSessionStartedConnecting(reconnecting: Boolean) {}
    override fun onConnectionBecamePoor() {}
    override fun onConnectionRecovered() {}
    override fun onRemoteVideoSourceAvailable(sources: List<RemoteVideoSource>) {}
    override fun onRemoteVideoSourceUnavailable(sources: List<RemoteVideoSource>) {}
    override fun onVideoSessionStarted(sessionStatus: MeetingSessionStatus) {}
    override fun onVideoSessionStartedConnecting() {}
    override fun onVideoSessionStopped(sessionStatus: MeetingSessionStatus) {}
    override fun onAttendeesDropped(attendeeInfo: Array<AttendeeInfo>) {}
    override fun onAttendeesLeft(attendeeInfo: Array<AttendeeInfo>) {}
    override fun onSignalStrengthChanged(signalUpdates: Array<SignalUpdate>) {}
    override fun onVolumeChanged(volumeUpdates: Array<VolumeUpdate>) {}
    override fun onVideoTilePaused(tileState: VideoTileState) {}
    override fun onVideoTileResumed(tileState: VideoTileState) {}
    override fun onVideoTileSizeChanged(tileState: VideoTileState) {}
    override fun onCameraSendAvailabilityUpdated(available: Boolean) {}



    /**
     *  Service integration
     */

    private fun registerPhoneAccount() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                val phoneAccount = PhoneAccount
                    .builder(phoneAccountHandle, config.applicationContext.packageName)
                    .setCapabilities(PhoneAccount.CAPABILITY_SELF_MANAGED)
                    .build()
                telecomManager.registerPhoneAccount(phoneAccount)
            } catch (exception: Exception) {
                logger.error(
                    tag,
                    "Failed to register phone account due to: ${exception.message}"
                )
            }
        } else {
            logger.warn(
                tag, "Build version ${Build.VERSION.SDK_INT} " +
                        " lower than ${Build.VERSION_CODES.O}, won't register phone account"
            )
        }
    }

    private fun startMicrophoneService() {
        // Start microphone service
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            config.applicationContext.startForegroundService(
                Intent(
                    config.applicationContext,
                    MicrophoneService::class.java
                ).also { intent ->
                    config.applicationContext.bindService(
                        intent,
                        microphoneServiceConnection,
                        Context.BIND_AUTO_CREATE
                    )
                }
            )
        }
    }
}
