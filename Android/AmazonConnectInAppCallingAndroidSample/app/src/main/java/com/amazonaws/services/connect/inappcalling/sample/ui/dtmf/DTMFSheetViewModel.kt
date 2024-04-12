/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample.ui.dtmf

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallManager
import kotlinx.coroutines.launch

internal class DTMFSheetViewModel (
    private val callManager: CallManager
) : ViewModel() {

    private val _sendingState = MutableLiveData<SendingState>()
    val sendingState: MutableLiveData<SendingState>
        get() = _sendingState

    fun sendDTMF(code: String) {
        viewModelScope.launch {
            sendingState.value = SendingState.SENDING
            val res = callManager.sendDTMF(digits = code)
            sendingState.setValue(if (res) SendingState.SENT else SendingState.ERROR)
        }
    }
}

enum class SendingState { SENDING, SENT, ERROR }
