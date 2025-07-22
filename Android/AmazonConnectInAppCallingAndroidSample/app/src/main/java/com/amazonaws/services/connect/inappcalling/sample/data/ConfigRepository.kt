/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample.data

import android.content.Context
import androidx.core.content.edit
import com.amazonaws.services.connect.inappcalling.sample.R

class ConfigRepository(private val context: Context) {

    private val prefs = context.getSharedPreferences("config_prefs", Context.MODE_PRIVATE)

    fun getConnectInstanceId(): String =
        prefs.getString(KEY_CONNECT_INSTANCE_ID, null)
            ?: context.getString(R.string.connect_instance_id)

    fun getContactFlowId(): String =
        prefs.getString(KEY_CONTACT_FLOW_ID, null)
            ?: context.getString(R.string.contact_flow_id)

    fun getStartWebrtcEndpoint(): String =
        prefs.getString(KEY_START_WEBRTC_ENDPOINT, null)
            ?: context.getString(R.string.start_webrtc_endpoint)

    fun getCreateParticipantConnectionEndpoint(): String =
        prefs.getString(KEY_CREATE_PARTICIPANT_ENDPOINT, null)
            ?: context.getString(R.string.create_participant_connection_endpoint)

    fun getSendMessageEndpoint(): String =
        prefs.getString(KEY_SEND_MESSAGE_ENDPOINT, null)
            ?: context.getString(R.string.send_message_endpoint)

    fun saveConnectInstanceId(value: String) {
        prefs.edit { putString(KEY_CONNECT_INSTANCE_ID, value) }
    }

    fun saveContactFlowId(value: String) {
        prefs.edit { putString(KEY_CONTACT_FLOW_ID, value) }
    }

    fun saveStartWebrtcEndpoint(value: String) {
        prefs.edit { putString(KEY_START_WEBRTC_ENDPOINT, value) }
    }

    fun saveCreateParticipantConnectionEndpoint(value: String) {
        prefs.edit { putString(KEY_CREATE_PARTICIPANT_ENDPOINT, value) }
    }

    fun saveSendMessageEndpoint(value: String) {
        prefs.edit { putString(KEY_SEND_MESSAGE_ENDPOINT, value) }
    }

    companion object {
        private const val KEY_CONNECT_INSTANCE_ID = "connect_instance_id"
        private const val KEY_CONTACT_FLOW_ID = "contact_flow_id"
        private const val KEY_START_WEBRTC_ENDPOINT = "start_webrtc_endpoint"
        private const val KEY_CREATE_PARTICIPANT_ENDPOINT = "create_participant_connection_endpoint"
        private const val KEY_SEND_MESSAGE_ENDPOINT = "send_message_endpoint"
    }
}