/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample.service

import android.telecom.CallAudioState
import android.telecom.Connection
import com.amazonaws.services.chime.sdk.meetings.utils.logger.ConsoleLogger
import com.amazonaws.services.connect.inappcalling.sample.common.getMediaDevice
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallManager

class CallConnection(private val callManager: CallManager) : Connection() {
    private val logger = ConsoleLogger()
    private val tag = "CallConnection"

    /**
     * The telecom subsystem calls this method to inform your app that the current audio route or mode has changed.
     * This is called in response to your app changing the audio mode using the setAudioRoute(int) method.
     * This method may also be called if the system changes the audio route (for example, when a Bluetooth headset disconnects).
     */
    override fun onCallAudioStateChanged(state: CallAudioState?) {
        logger.info(tag, "onCallAudioStateChanged to state: $state")
        state?.let { callManager.updateActiveDevice(getMediaDevice(it)) }
    }

    override fun onStateChanged(state: Int) {
        logger.info(tag, "onStateChanged to state: $state")
    }

    /**
     * The telecom subsystem calls this method when it wants to disconnect a call.
     * Once the call has ended, your app should call the setDisconnected(DisconnectCause) method
     * and specify LOCAL as the parameter to indicate that a user request caused the call to be disconnected.
     * Your app should then call the destroy() method to inform the telecom subsystem that the app has processed the call.
     * The system may call this method when the user has disconnected a call through another in-call service such as Android Auto.
     */
    override fun onDisconnect() {
        logger.info(tag, "onDisconnect")
        callManager.endCall()
    }
}
