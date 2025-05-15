package com.amazonaws.services.connect.inappcalling.sample.data.domain.screenshare

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.IBinder
import com.amazonaws.services.chime.sdk.meetings.audiovideo.contentshare.ContentShareController
import com.amazonaws.services.chime.sdk.meetings.audiovideo.contentshare.ContentShareSource
import com.amazonaws.services.chime.sdk.meetings.audiovideo.video.VideoSink
import com.amazonaws.services.chime.sdk.meetings.audiovideo.video.VideoSource
import com.amazonaws.services.chime.sdk.meetings.audiovideo.video.capture.CaptureSourceError
import com.amazonaws.services.chime.sdk.meetings.audiovideo.video.capture.CaptureSourceObserver
import com.amazonaws.services.chime.sdk.meetings.audiovideo.video.capture.DefaultScreenCaptureSource
import com.amazonaws.services.chime.sdk.meetings.realtime.datamessage.DataMessage
import com.amazonaws.services.chime.sdk.meetings.utils.logger.ConsoleLogger
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallStateRepository
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.lang.ref.WeakReference

const val AMAZON_CONNECT_SCREEN_SHARING_TOPIC = "AMAZON_CONNECT_SCREEN_SHARING"
class ScreenShareManager(
    private val callStateRepository: CallStateRepository,
    private val screenCaptureSourceFactory: ScreenCaptureSourceFactory,
    private val context: Context
) : ContentShareSource() {
    override var videoSource: VideoSource?
        get() = screenCaptureSource
        set(_) {}

    private var screenShareController: WeakReference<ContentShareController>? = null
    private var screenCaptureConnectionService: ServiceConnection? = null
    private var screenCaptureSource: DefaultScreenCaptureSource? = null

    private val logger = ConsoleLogger()
    private var isBound: Boolean = false

    /*
     * Check if the data message is from topic `AMAZON_CONNECT_SCREEN_SHARING`,
     * if yes, it will update ScreenShareCapabilityEnabled flag accordingly,
     * if no, it will return immediately.
     */
    fun handleDataMessage(dataMessage: DataMessage) {
        if(dataMessage.topic != AMAZON_CONNECT_SCREEN_SHARING_TOPIC) {
            return
        }
        val payloadType = object : TypeToken<Map<String, String>>() {}.type
        val messageMap: Map<String, String> = Gson().fromJson(dataMessage.text(), payloadType)
        val message = messageMap["message"]
        message?.let { messageStr ->
            val screenShareDataMessageType = ScreenShareDataMessageType.fromString(messageStr)
            screenShareDataMessageType.let {screenShareMessageType ->
                when (screenShareMessageType) {
                    ScreenShareDataMessageType.STARTED -> callStateRepository.updateScreenShareCapabilityEnabled(true)
                    ScreenShareDataMessageType.STOPPED -> {
                        stop()
                        callStateRepository.updateScreenShareCapabilityEnabled(false)
                    }
                    else -> {}
                }
            }
        }
    }

    fun startScreenShare(resultCode: Int, data: Intent,
                         screenShareController: ContentShareController
    ) {
        screenCaptureConnectionService = object : ServiceConnection {
            override fun onServiceConnected(className: ComponentName, service: IBinder) {
                screenCaptureSource = screenCaptureSourceFactory
                    .createCaptureSource(context, logger, resultCode, data)

                isBound = true

                val screenCaptureSourceObserver = object : CaptureSourceObserver {
                    override fun onCaptureStarted() {
                        videoSource?.let { screenShareController.startContentShare(this@ScreenShareManager) }
                        // callStateRepository.updateScreenShareTileStates(null)
                        callStateRepository.updateScreenShareStatus(ScreenShareStatus.LOCAL)
                    }

                    override fun onCaptureStopped() {
                        if(callStateRepository.getScreenShareStatus() != ScreenShareStatus.REMOTE) {
                            callStateRepository.updateScreenShareStatus(ScreenShareStatus.NONE)
                        }
                    }

                    override fun onCaptureFailed(error: CaptureSourceError) {
                        screenShareController.stopContentShare()
                    }
                }
                addObserver(screenCaptureSourceObserver)

                screenCaptureSource?.start()
            }

            override fun onServiceDisconnected(arg0: ComponentName) {
                isBound = false
            }
        }

        context.startService(
            Intent(
                context,
                ScreenCaptureService::class.java
            ).also { intent ->
                screenCaptureConnectionService?.let {
                    context.bindService(
                        intent,
                        it,
                        Context.BIND_AUTO_CREATE
                    )
                }
            })
        this.screenShareController = WeakReference(screenShareController)
    }

    fun stop() {
        screenShareController?.get()?.stopContentShare()

        context.stopService(Intent(context, ScreenCaptureService::class.java))

        screenCaptureSource?.stop()
        screenCaptureSource?.release()

        // screenCaptureSource?.release()
        screenCaptureConnectionService?.let {
            if (isBound) context.unbindService(it)
        }
        screenShareController = null
    }

    fun addVideoSink(videoSink: VideoSink) {
        screenCaptureSource?.let { it.addVideoSink(videoSink) }
    }

    fun removeVideoSink(videoSink: VideoSink) {
        screenCaptureSource?.let { it.removeVideoSink(videoSink) }
    }

    fun addObserver(observer: CaptureSourceObserver) = screenCaptureSource?.addCaptureSourceObserver(observer)

    fun removeObserver(observer: CaptureSourceObserver) = screenCaptureSource?.removeCaptureSourceObserver(observer)
}
