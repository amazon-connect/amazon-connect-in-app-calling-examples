/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample.ui.screenshare

import android.content.DialogInterface
import android.graphics.drawable.Drawable
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleObserver
import androidx.lifecycle.ViewModelProvider
import com.amazonaws.services.connect.inappcalling.sample.R
import com.amazonaws.services.connect.inappcalling.sample.ServiceLocatorProvider
import com.amazonaws.services.connect.inappcalling.sample.data.domain.screenshare.ScreenShareStatus
import com.amazonaws.services.connect.inappcalling.sample.databinding.CallSheetFullScreenShareBinding
import com.amazonaws.services.connect.inappcalling.sample.ui.BaseBottomSheetFragment
import com.amazonaws.services.connect.inappcalling.sample.ui.utils.ViewModelFactory

internal class FullScreenShareSheet : BaseBottomSheetFragment(isFullHeight = true),
    LifecycleObserver {
    companion object {
        const val TAG = "FullScreenShareSheet"
    }

    private lateinit var screenSharePanel: ScreenSharePanel
    private lateinit var viewModel: FullScreenShareViewModel
    private lateinit var binding: CallSheetFullScreenShareBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val serviceLocator =  (activity?.application as ServiceLocatorProvider).getServiceLocator()
        viewModel = ViewModelProvider(
            this,
            ViewModelFactory(
                serviceLocator.callManager,
                serviceLocator.callStateRepo
            )
        )[FullScreenShareViewModel::class.java]
    }
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? = inflater.inflate(R.layout.call_sheet_full_screen_share, container, false)
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding = CallSheetFullScreenShareBinding.bind(view)

        screenSharePanel = ScreenSharePanel(binding.screenSharePanel,
            this, (activity?.application as ServiceLocatorProvider).getServiceLocator(), this)
        screenSharePanel.initMaximizeButton {
            dismiss()
        }

        val minimizeIcon: Drawable? = ContextCompat.getDrawable(
            requireContext(), R.drawable.ic_minimize)
        binding.screenSharePanel.maximizeButton.setImageDrawable(minimizeIcon)

        viewModel.screenShareStatus.observe(this, ::handleScreenShareStatusUpdate)
    }

    override fun onDestroy() {
        super.onDestroy()
    }

    private fun handleScreenShareStatusUpdate(screenShareStatus: ScreenShareStatus) {
        if(screenShareStatus == ScreenShareStatus.NONE) {
            dismiss()
        }
    }
}
