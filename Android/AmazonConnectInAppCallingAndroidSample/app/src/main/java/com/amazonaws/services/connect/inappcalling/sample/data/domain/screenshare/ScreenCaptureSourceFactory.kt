package com.amazonaws.services.connect.inappcalling.sample.data.domain.screenshare

import android.content.Context
import android.content.Intent
import com.amazonaws.services.chime.sdk.meetings.audiovideo.video.capture.DefaultScreenCaptureSource
import com.amazonaws.services.chime.sdk.meetings.audiovideo.video.capture.DefaultSurfaceTextureCaptureSourceFactory
import com.amazonaws.services.chime.sdk.meetings.audiovideo.video.gl.EglCoreFactory
import com.amazonaws.services.chime.sdk.meetings.utils.logger.ConsoleLogger

class ScreenCaptureSourceFactory(
    private val eglCoreFactory: EglCoreFactory,
) {
    fun createCaptureSource(
        context: Context, logger: ConsoleLogger, resultCode: Int, data: Intent
    ): DefaultScreenCaptureSource {
        return DefaultScreenCaptureSource(
            context,
            logger,
            DefaultSurfaceTextureCaptureSourceFactory(
                logger,
                eglCoreFactory
            ),
            resultCode,
            data
        )
    }
}