/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.amazonaws.services.connect.inappcalling.sample.common.showGeneralErrorAlert
import com.amazonaws.services.connect.inappcalling.sample.databinding.ActivityMainBinding
import com.amazonaws.services.connect.inappcalling.sample.ui.CallSheet

const val displayNameKey = "DisplayName"
const val cityKey = "City"
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

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
        // Create service locator for data access
        val config = CallConfiguration(
            applicationContext = applicationContext,
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
