/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample.ui.controlpanel.preferences

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.amazonaws.services.connect.inappcalling.sample.data.domain.BackgroundBlurState
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallError
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallManager
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallObserver
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallStateRepository
import com.amazonaws.services.connect.inappcalling.sample.data.utils.Transient

import kotlinx.coroutines.launch

internal class PreferencesSheetViewModel(
    private val callManager: CallManager,
    private val callStateRepository: CallStateRepository
) : ViewModel(), CallObserver {

    private val _error = MutableLiveData<Transient<CallError>>()
    val error: LiveData<Transient<CallError>> = _error

    private val _voiceFocusEnabled = MutableLiveData(callStateRepository.isVoiceFocusEnabled())
    val voiceFocusEnabled: LiveData<Boolean> = _voiceFocusEnabled

    private val _backgroundBlurState = MutableLiveData(callStateRepository.getBackgroundBlurState())
    val backgroundBlurState: LiveData<BackgroundBlurState?> = _backgroundBlurState

    val backgroundBlurOptions = mutableListOf<BackgroundBlurOption>()

    fun setVoiceFocusEnabled(enabled: Boolean) {
        viewModelScope.launch {
            val res = callManager.setVoiceFocusEnabled(enabled)
            if (res) {
                _voiceFocusEnabled.value = enabled
            } else {
                _error.value = Transient(CallError.FAIL_TO_CHANGE_VOICE_FOCUS)
            }
        }
    }

    fun getBackgroundBlurState() {
        viewModelScope.launch {
            _backgroundBlurState.value = callStateRepository.getBackgroundBlurState()
        }
    }

    fun refreshBackgroundBlurOptions() : List<BackgroundBlurOption> {
        viewModelScope.launch {
            backgroundBlurOptions.clear()
            backgroundBlurOptions.addAll(BackgroundBlurState.values().map {
                BackgroundBlurOption(it, callStateRepository.getBackgroundBlurState() == it)
            }.toList())
        }
        return backgroundBlurOptions
    }

    fun updateBackgroundBlurState(state: BackgroundBlurState) {
        viewModelScope.launch {
            callManager.setBackgroundBlur(state)
            refreshBackgroundBlurOptions()
        }
    }
}
