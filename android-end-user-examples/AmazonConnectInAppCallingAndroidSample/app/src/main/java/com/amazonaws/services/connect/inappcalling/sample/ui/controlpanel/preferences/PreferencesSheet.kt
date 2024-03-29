/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample.ui.controlpanel.preferences

import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.lifecycle.ViewModelProvider
import com.amazonaws.services.connect.inappcalling.sample.ServiceLocatorProvider
import com.amazonaws.services.connect.inappcalling.sample.R
import com.amazonaws.services.connect.inappcalling.sample.data.domain.BackgroundBlurState
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallError
import com.amazonaws.services.connect.inappcalling.sample.data.utils.Transient
import com.amazonaws.services.connect.inappcalling.sample.databinding.CallSheetPreferenceSheetBinding
import com.amazonaws.services.connect.inappcalling.sample.common.showGeneralErrorAlert
import com.amazonaws.services.connect.inappcalling.sample.ui.BaseBottomSheetFragment
import com.amazonaws.services.connect.inappcalling.sample.ui.utils.ViewModelFactory
import com.google.android.material.dialog.MaterialAlertDialogBuilder

internal class PreferencesSheet : BaseBottomSheetFragment(isFullHeight = true) {

    companion object {
        const val TAG = "PreferencesSheet"
    }

    private lateinit var viewModel: PreferencesSheetViewModel
    private lateinit var binding: CallSheetPreferenceSheetBinding

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        val serviceProvider = (activity?.application as ServiceLocatorProvider).getServiceLocator()
        viewModel = ViewModelProvider(
            this,
            ViewModelFactory(serviceProvider.callManager, serviceProvider.callStateRepo)
        )[PreferencesSheetViewModel::class.java]

        binding = CallSheetPreferenceSheetBinding.bind(view)
        binding.minimizeButton.setOnClickListener { dismiss() }
        configureSpeechEnhancement()
        configureVideoEnhancement()

        viewModel.error.observe(this, ::handleErrorEvent)
    }

    private fun configureSpeechEnhancement() {
        binding.voiceFocusSwitch.setOnCheckedChangeListener { _, checked ->
            viewModel.setVoiceFocusEnabled(checked)
            binding.voiceFocusSwitch.isChecked = viewModel.voiceFocusEnabled.value == true
        }

        viewModel.voiceFocusEnabled.observe(this, ::handleVoiceFocusEnabledChange)
    }

    private fun handleVoiceFocusEnabledChange(enabled: Boolean) {
        binding.voiceFocusSwitch.isChecked = enabled
    }

    private fun configureVideoEnhancement() {
        binding.backgroundBlurContainer.setOnClickListener {
            createBGBlurSelectionDialog()?.show()
        }

        viewModel.backgroundBlurState.observe(this, ::handleBackgroundBlurStateChange)
    }

    private fun handleBackgroundBlurStateChange(state: BackgroundBlurState?) {
        val stateText = when (state) {
            BackgroundBlurState.HIGH -> getString(R.string.call_sheet_background_blur_high)
            BackgroundBlurState.MEDIUM -> getString(R.string.call_sheet_background_blur_medium)
            BackgroundBlurState.LOW -> getString(R.string.call_sheet_background_blur_low)
            BackgroundBlurState.OFF -> getString(R.string.call_sheet_background_blur_off)
            else -> getString(R.string.call_sheet_background_blur_off)
        }
        binding.bgBlurStatusText.text = stateText
    }

    private fun handleErrorEvent(errorEvent: Transient<CallError>) {
        errorEvent.get()?.let {
            context?.showGeneralErrorAlert(it.message)
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? = inflater.inflate(R.layout.call_sheet_preference_sheet, container, false)

    private fun createBGBlurSelectionDialog(): AlertDialog? {
        return context?.let {
            val adapter = BackgroundBlurStateAdapter(
                it,
                android.R.layout.simple_list_item_1,
                viewModel.refreshBackgroundBlurOptions()
            )

            MaterialAlertDialogBuilder(it)
                .setTitle(it.getString(R.string.call_sheet_background_blur_dialog_title))
                .setNegativeButton(it.getString(R.string.call_sheet_bg_blur_dialog_cancel_button_text)) { dialog, _ ->
                    dialog.dismiss()
                }
                .setOnDismissListener { viewModel.getBackgroundBlurState() }
                .setAdapter(adapter) { _, which ->
                    run {
                        viewModel.updateBackgroundBlurState(viewModel.backgroundBlurOptions[which].state)
                    }
                }.create()
        }
    }
}

private class BackgroundBlurStateAdapter(
    context: Context,
    resource: Int,
    private val options: List<BackgroundBlurOption>
) : ArrayAdapter<BackgroundBlurOption>(context, resource, options) {

    override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
        val view = super.getView(position, convertView, parent) as TextView
        var displayText = options[position].state.name
        var contentDescription = options[position].state.name
        if (options[position].isSelected) {
            displayText += "  ✓"
            contentDescription += " ${context.getString(R.string.call_sheet_device_dialog_option_active_content)}"
        }
        view.text = displayText
        view.contentDescription = contentDescription
        return view
    }
}

internal data class BackgroundBlurOption(val state: BackgroundBlurState, val isSelected: Boolean)
