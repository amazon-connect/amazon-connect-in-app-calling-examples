/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample.ui.utils

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallManager
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallStateRepository
import com.amazonaws.services.connect.inappcalling.sample.ui.CallSheetViewModel
import com.amazonaws.services.connect.inappcalling.sample.ui.dtmf.DTMFSheetViewModel
import com.amazonaws.services.connect.inappcalling.sample.ui.controlpanel.preferences.PreferencesSheetViewModel
import com.amazonaws.services.connect.inappcalling.sample.ui.screenshare.FullScreenShareViewModel
import com.amazonaws.services.connect.inappcalling.sample.ui.screenshare.ScreenSharePanelViewModel

internal class ViewModelFactory(
    private val callManager: CallManager,
    private val callStateRepository: CallStateRepository
    ) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T = with(modelClass) {
        when {
            isAssignableFrom(CallSheetViewModel::class.java) ->
                CallSheetViewModel(callManager, callStateRepository)
            isAssignableFrom(DTMFSheetViewModel::class.java) ->
                DTMFSheetViewModel(callManager)
            isAssignableFrom(PreferencesSheetViewModel::class.java) ->
                PreferencesSheetViewModel(callManager, callStateRepository)
            isAssignableFrom(ScreenSharePanelViewModel::class.java) ->
                ScreenSharePanelViewModel(callManager, callStateRepository)
            isAssignableFrom(FullScreenShareViewModel::class.java) ->
                FullScreenShareViewModel(callStateRepository)
            else ->
                throw IllegalArgumentException("Unknown ViewModel class: ${modelClass.name}")
        }
    } as T
}
