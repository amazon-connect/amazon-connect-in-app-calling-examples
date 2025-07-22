/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample.ui.utils

import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.amazonaws.services.connect.inappcalling.sample.R
import com.amazonaws.services.connect.inappcalling.sample.data.ConfigRepository
import com.amazonaws.services.connect.inappcalling.sample.databinding.ConfigDialogBinding
import com.google.android.material.dialog.MaterialAlertDialogBuilder

class ConfigDialog(
    private val activity: AppCompatActivity,
    private val configRepository: ConfigRepository
) {

    /**
     * Show the configuration dialog.
     * Loads current config values into inputs,
     * sets up buttons for Save, Cancel and Reset.
     */
    fun show() {
        val binding = ConfigDialogBinding.inflate(activity.layoutInflater)
        loadValues(binding)

        MaterialAlertDialogBuilder(activity)
            .setTitle("Configure Endpoints")
            .setView(binding.root)
            .setPositiveButton("Save") { _, _ ->
                saveFromBinding(binding)
                Toast.makeText(activity, "Saved", Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton("Cancel", null)
            .setNeutralButton("Reset") { _, _ ->
                resetToDefault(binding)
                saveFromBinding(binding)
                Toast.makeText(activity, "Reset to default and saved", Toast.LENGTH_SHORT).show()
            }
            .show()
    }

    /**
     * Load current stored configuration values into the input fields.
     */
    private fun loadValues(binding: ConfigDialogBinding) {
        binding.etConnectInstanceId.setText(configRepository.getConnectInstanceId())
        binding.etContactFlowId.setText(configRepository.getContactFlowId())
        binding.etStartWebrtcEndpoint.setText(configRepository.getStartWebrtcEndpoint())
        binding.etCreateParticipantConnectionEndpoint.setText(configRepository.getCreateParticipantConnectionEndpoint())
        binding.etSendMessageEndpoint.setText(configRepository.getSendMessageEndpoint())
    }

    /**
     * Save the input values from dialog into the repository.
     * Only saves non-empty values.
     */
    private fun saveFromBinding(binding: ConfigDialogBinding) {
        binding.etConnectInstanceId.text.toString().trim().takeIf { it.isNotEmpty() }?.let {
            configRepository.saveConnectInstanceId(it)
        }
        binding.etContactFlowId.text.toString().trim().takeIf { it.isNotEmpty() }?.let {
            configRepository.saveContactFlowId(it)
        }
        binding.etStartWebrtcEndpoint.text.toString().trim().takeIf { it.isNotEmpty() }?.let {
            configRepository.saveStartWebrtcEndpoint(it)
        }
        binding.etCreateParticipantConnectionEndpoint.text.toString().trim().takeIf { it.isNotEmpty() }?.let {
            configRepository.saveCreateParticipantConnectionEndpoint(it)
        }
        binding.etSendMessageEndpoint.text.toString().trim().takeIf { it.isNotEmpty() }?.let {
            configRepository.saveSendMessageEndpoint(it)
        }
    }

    /**
     * Reset the input fields to default values stored in string resources.
     */
    private fun resetToDefault(binding: ConfigDialogBinding) {
        binding.etConnectInstanceId.setText(activity.getString(R.string.connect_instance_id))
        binding.etContactFlowId.setText(activity.getString(R.string.contact_flow_id))
        binding.etStartWebrtcEndpoint.setText(activity.getString(R.string.start_webrtc_endpoint))
        binding.etCreateParticipantConnectionEndpoint.setText(activity.getString(R.string.create_participant_connection_endpoint))
        binding.etSendMessageEndpoint.setText(activity.getString(R.string.send_message_endpoint))
    }
}