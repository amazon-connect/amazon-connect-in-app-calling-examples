/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample

import com.amazonaws.services.chime.sdk.meetings.audiovideo.video.gl.DefaultEglCoreFactory
import com.amazonaws.services.chime.sdk.meetings.audiovideo.video.gl.EglCoreFactory
import com.amazonaws.services.connect.inappcalling.sample.data.api.ApiClient
import com.amazonaws.services.connect.inappcalling.sample.data.api.ApiClientConfig
import com.amazonaws.services.connect.inappcalling.sample.data.api.DefaultApiClient
import com.amazonaws.services.connect.inappcalling.sample.data.api.ReactDemoClient
import com.amazonaws.services.connect.inappcalling.sample.data.utils.ConnectionTokenProvider
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallManager
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallStateRepository
import com.amazonaws.services.connect.inappcalling.sample.data.domain.screenshare.ScreenCaptureSourceFactory
import com.amazonaws.services.connect.inappcalling.sample.data.domain.screenshare.ScreenShareManager

class ServiceLocator(private val config: CallConfiguration) {

    private val apiClient: ApiClient by lazy {
        ReactDemoClient()
    }

    private val connectionTokenProvider: ConnectionTokenProvider by lazy {
        ConnectionTokenProvider(apiClient = apiClient)
    }

    val callStateRepo: CallStateRepository by lazy { CallStateRepository() }

    private val eglCoreFactory: EglCoreFactory by lazy {
        DefaultEglCoreFactory()
    }

    private val screenCaptureSourceFactory: ScreenCaptureSourceFactory by lazy {
        ScreenCaptureSourceFactory(eglCoreFactory = eglCoreFactory)
    }

    private val screenShareManager: ScreenShareManager by lazy {
        ScreenShareManager(callStateRepo, screenCaptureSourceFactory, config.applicationContext)
    }

    val callManager: CallManager by lazy {
        CallManager(
            config = config,
            screenShareManager = screenShareManager,
            callStateRepository = callStateRepo,
            tokenProvider = connectionTokenProvider,
            apiClient = apiClient,
            eglCoreFactory = eglCoreFactory
        )
    }
}

interface ServiceLocatorProvider {
    fun getServiceLocator(): ServiceLocator

    fun updateServiceLocator(newServiceLocator: ServiceLocator) {}
}
