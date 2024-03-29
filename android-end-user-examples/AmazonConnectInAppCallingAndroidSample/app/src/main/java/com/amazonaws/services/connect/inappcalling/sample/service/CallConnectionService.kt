/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample.service

import android.os.Build
import android.telecom.Connection
import android.telecom.ConnectionRequest
import android.telecom.ConnectionService
import android.telecom.PhoneAccountHandle
import com.amazonaws.services.chime.sdk.meetings.utils.logger.ConsoleLogger
import com.amazonaws.services.connect.inappcalling.sample.ServiceLocatorProvider

class CallConnectionService : ConnectionService() {
    private val logger = ConsoleLogger()
    private val tag = "CallConnectionService"

    companion object {
        var connection: Connection? = null
    }
    /**
     * called by Telecom to ask your app to make a new Connection to represent an outgoing call
     * your app requested via TelecomManager#placeCall(Uri, Bundle).
     */
    override fun onCreateOutgoingConnection(
        fromPhoneAccountHandle: PhoneAccountHandle?,
        request: ConnectionRequest?
    ): Connection {
        logger.info(tag, "onCreateOutgoingConnection")
        connection = CallConnection(
            (application as ServiceLocatorProvider).getServiceLocator().callManager
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            connection?.connectionProperties = Connection.PROPERTY_SELF_MANAGED
        }
        connection?.audioModeIsVoip = true
        return connection!!
    }


    /**
     *  called by Telecom to inform your app that a call it reported via
     *  TelecomManager#placeCall(Uri, Bundle) cannot be handled at this time. Your app should NOT place a call at the current time.
     */
    override fun onCreateOutgoingConnectionFailed(
        connectionManagerPhoneAccount: PhoneAccountHandle?,
        request: ConnectionRequest?
    ) {
        logger.error(tag, "onCreateOutgoingConnectionFailed")
    }
}
