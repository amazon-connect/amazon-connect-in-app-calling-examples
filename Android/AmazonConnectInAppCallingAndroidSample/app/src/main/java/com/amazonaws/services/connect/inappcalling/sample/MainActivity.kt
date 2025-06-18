/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import com.amazonaws.services.connect.inappcalling.sample.common.showGeneralErrorAlert
import com.amazonaws.services.connect.inappcalling.sample.data.ConfigRepository
import com.amazonaws.services.connect.inappcalling.sample.databinding.ActivityMainBinding
import com.amazonaws.services.connect.inappcalling.sample.ui.CallSheet
import com.amazonaws.services.connect.inappcalling.sample.ui.utils.ConfigDialog

const val displayNameKey = "DisplayName"
const val cityKey = "City"
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var configRepo: ConfigRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // set system bar's text color suits for a light bg
        WindowCompat.getInsetsController(window, window.decorView)
                .isAppearanceLightStatusBars = true

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        configRepo = ConfigRepository(applicationContext)

        binding.btnConfig.setOnClickListener {
            ConfigDialog(this, configRepo).show()
        }

        binding.startCallButton.setOnClickListener {
            startCall()
        }
    }

    private fun startCall() {
        // Get input texts
        val displayName = binding.displayName.editText?.text?.trim()?.toString()
        val city = binding.city.editText?.text?.trim()?.toString()

        if (displayName.isNullOrEmpty() || city.isNullOrEmpty()) {
            showGeneralErrorAlert(getString(R.string.error_input_are_required))
            return
        }

        val connectInstanceId = configRepo.getConnectInstanceId()
        val contactFlowId = configRepo.getContactFlowId()
        val startWebrtcEndpoint = configRepo.getStartWebrtcEndpoint()
        val createParticipantConnectionEndpoint = configRepo.getCreateParticipantConnectionEndpoint()
        val sendMessageEndpoint = configRepo.getSendMessageEndpoint()

        // Create service locator for data access
        val config = CallConfiguration(
            applicationContext = applicationContext,
            connectInstanceId = connectInstanceId,
            contactFlowId = contactFlowId,
            startWebrtcEndpoint = startWebrtcEndpoint,
            createParticipantConnectionEndpoint = createParticipantConnectionEndpoint,
            sendMessageEndpoint = sendMessageEndpoint,
            displayName = displayName,
            attributes = mapOf(displayNameKey to displayName, cityKey to city)
        )
        val serviceLocator = ServiceLocator(config)
        // Set global service locator
        (application as ServiceLocatorProvider).updateServiceLocator(serviceLocator)
        // Bring up the call sheet
        val sheet = CallSheet()
        sheet.show(supportFragmentManager, CallSheet.TAG)
    }
}
