/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample.ui.dtmf

import android.os.Build
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.view.WindowManager.LayoutParams.SOFT_INPUT_STATE_VISIBLE
import android.view.inputmethod.EditorInfo
import android.widget.EditText
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.lifecycle.ViewModelProvider
import com.amazonaws.services.connect.inappcalling.sample.ServiceLocatorProvider
import com.amazonaws.services.connect.inappcalling.sample.R
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallError
import com.amazonaws.services.connect.inappcalling.sample.databinding.CallSheetDtmfSheetBinding
import com.amazonaws.services.connect.inappcalling.sample.common.gone
import com.amazonaws.services.connect.inappcalling.sample.ui.BaseBottomSheetFragment
import com.amazonaws.services.connect.inappcalling.sample.ui.utils.ViewModelFactory
import com.amazonaws.services.connect.inappcalling.sample.common.visible

class DTMFSheet: BaseBottomSheetFragment() {

    companion object {
        const val TAG = "DTMFSheet"
    }

    private lateinit var viewModel: DTMFSheetViewModel
    private lateinit var dtmfSheetBinding: CallSheetDtmfSheetBinding

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        // Initialize view model
        val serviceLocator = (activity?.application as ServiceLocatorProvider).getServiceLocator()
        viewModel = ViewModelProvider(
            this,
            ViewModelFactory(
                serviceLocator.callManager,
                serviceLocator.callStateRepo
            )
        )[DTMFSheetViewModel::class.java]


        // Set up sheet UI
        dtmfSheetBinding = CallSheetDtmfSheetBinding.bind(view)
        dtmfSheetBinding.sendButton.setOnClickListener { sendDTMF() }
        dtmfSheetBinding.callSheetMinimizeButton.setOnClickListener { dismiss() }

        // Observe data
        viewModel.sendingState.observe(this, ::handleCodeSend)
    }

    private fun handleCodeSend(state: SendingState) {
        when (state) {
            SendingState.SENDING -> {
                dtmfSheetBinding.progressBar.visible()
                dtmfSheetBinding.sendButton.gone()
            }
            SendingState.SENT -> {
                dtmfSheetBinding.progressBar.gone()
                dtmfSheetBinding.sendButton.visible()
                dtmfSheetBinding.messageView.setBackgroundResource(R.drawable.ic_keypad_message_success)
                dtmfSheetBinding.messageView.setTextColor(ContextCompat.getColor(requireContext(), R.color.dtmf_sent_message_text_green))
                dtmfSheetBinding.inputTextView.text.clear()
                dtmfSheetBinding.messageView.text = getString(R.string.call_sheet_dtmf_sheet_message_sent_description)
                dtmfSheetBinding.messageView.visible()
            }
            SendingState.ERROR -> {
                dtmfSheetBinding.progressBar.gone()
                dtmfSheetBinding.sendButton.visible()
                dtmfSheetBinding.messageView.setBackgroundResource(R.drawable.ic_keypad_message_fail)
                dtmfSheetBinding.messageView.setTextColor(ContextCompat.getColor(requireContext(), R.color.dtmf_error_message_text_red))
                dtmfSheetBinding.messageView.text = CallError.FAIL_TO_SEND_DTMF.message
                dtmfSheetBinding.messageView.visible()
            }
        }
    }

    private fun sendDTMF() {
        val code = dtmfSheetBinding.inputTextView.text.toString()
        if (code != "") {
            viewModel.sendDTMF(code)
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        val view: View = inflater.inflate(R.layout.call_sheet_dtmf_sheet, container)

        // Show soft keyboard
        val inputView = view.findViewById<View>(R.id.input_text_view) as EditText
        inputView.requestFocus()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // Use the new API for Android 30 (API R) and above
            requireDialog().window?.let { window ->
                WindowCompat.setDecorFitsSystemWindows(window, false)
                ViewCompat.setOnApplyWindowInsetsListener(window.decorView) { _, insets ->
                    val imeHeight = insets.getInsets(WindowInsetsCompat.Type.ime()).bottom
                    val navigationBarHeight = insets.getInsets(WindowInsetsCompat.Type.navigationBars()).bottom
                    view.setPadding(0, 0, 0, imeHeight - navigationBarHeight)
                    insets
                }

                val controller = WindowInsetsControllerCompat(window, window.decorView)
                controller.show(WindowInsetsCompat.Type.ime())
            }
        } else {
            // Use the legacy API for Android below 30
            @Suppress("DEPRECATION")
            dialog?.window?.setSoftInputMode(SOFT_INPUT_STATE_VISIBLE or WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE)
        }

        inputView.setOnEditorActionListener { _, actionId, _ ->
            return@setOnEditorActionListener when (actionId) {
                EditorInfo.IME_ACTION_SEND -> {
                    sendDTMF()
                    true
                }
                else -> false
            }
        }
        return view
    }
}
