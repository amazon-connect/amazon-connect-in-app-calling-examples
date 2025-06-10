/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample.ui.screenshare

import android.view.View
import android.widget.ImageButton
import android.widget.TextView
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.ViewModelStoreOwner
import com.amazonaws.services.chime.sdk.meetings.audiovideo.video.VideoScalingType
import com.amazonaws.services.chime.sdk.meetings.audiovideo.video.VideoTileState
import com.amazonaws.services.chime.sdk.meetings.audiovideo.video.gl.TextureRenderView
import com.amazonaws.services.connect.inappcalling.sample.R
import com.amazonaws.services.connect.inappcalling.sample.ServiceLocator
import com.amazonaws.services.connect.inappcalling.sample.data.domain.screenshare.ScreenShareStatus
import com.amazonaws.services.connect.inappcalling.sample.databinding.CallSheetScreenSharePanelBinding
import com.amazonaws.services.connect.inappcalling.sample.ui.utils.ViewModelFactory

internal class ScreenSharePanel(
    private val screenRenderView: TextureRenderView,
    private val senderTextView: TextView,
    private val maximizeButton: ImageButton,
    private val viewModel: ScreenSharePanelViewModel
) {
    constructor(binding: CallSheetScreenSharePanelBinding,
                vmStoreOwner: ViewModelStoreOwner,
                serviceLocator: ServiceLocator,
                lifecycleOwner: LifecycleOwner
    ): this (
        screenRenderView = binding.screenShareRenderView,
        senderTextView = binding.senderTextView,
        maximizeButton = binding.maximizeButton,
        viewModel = ViewModelProvider(
            vmStoreOwner,
            ViewModelFactory(
                serviceLocator.callManager,
                serviceLocator.callStateRepo
            )
        )[ScreenSharePanelViewModel::class.java]
    ) {
        screenRenderView.scalingType = VideoScalingType.AspectFit

        viewModel.screenShareStatus.observe(lifecycleOwner, ::handleScreenShareStatusUpdate)
        viewModel.screenShareTileState.observe(lifecycleOwner, ::handleScreenShareTileStateUpdate)
    }

    fun initMaximizeButton(onClick: (View) -> Unit) {
        maximizeButton.setOnClickListener { onClick.invoke(it) }
    }

    private fun handleScreenShareStatusUpdate(screenShareStatus: ScreenShareStatus) {
        if(screenShareStatus == ScreenShareStatus.LOCAL) {
            // Bind screenRenderView with local screen share source when enabled
            viewModel.bindLocalScreenShareView(screenRenderView)
        } else {
            // Unbind screenRenderView with local screen share source when enabled
            viewModel.unbindLocalScreenShareView(screenRenderView)
        }

        updateSenderTextView()
    }

    private fun handleScreenShareTileStateUpdate(tileState: VideoTileState?) {
        tileState?.let {
            // Bind screenRenderView with remote tile state when remote enabled screen share
            viewModel.bindVideoView(screenRenderView, it.tileId)
        }
        updateSenderTextView()
    }

    private fun updateSenderTextView() {
        viewModel.screenShareStatus?.value.let{
            when(it) {
                ScreenShareStatus.LOCAL -> {
                    senderTextView.setText(R.string.call_sheet_screen_share_local_sender)
                }
                ScreenShareStatus.REMOTE -> {
                    senderTextView.setText(R.string.call_sheet_screen_share_remote_sender)
                }
                else -> {
                    senderTextView.text = null
                }
            }
        }
    }
}
