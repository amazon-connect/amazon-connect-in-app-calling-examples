/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample.ui

import android.content.Context
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.TextView
import androidx.activity.result.ActivityResultLauncher
import androidx.lifecycle.ViewModelProvider
import com.amazonaws.services.chime.sdk.meetings.device.MediaDevice
import com.amazonaws.services.chime.sdk.meetings.device.MediaDeviceType
import com.amazonaws.services.connect.inappcalling.sample.ServiceLocatorProvider
import com.amazonaws.services.connect.inappcalling.sample.R
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallState
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallerVideoState
import com.amazonaws.services.connect.inappcalling.sample.databinding.CallSheetBinding
import com.amazonaws.services.connect.inappcalling.sample.databinding.CallSheetContentBeforeCallBinding
import com.amazonaws.services.connect.inappcalling.sample.databinding.CallSheetContentCallingBinding
import com.amazonaws.services.connect.inappcalling.sample.databinding.CallSheetContentInCallBinding
import com.amazonaws.services.connect.inappcalling.sample.common.gone
import com.amazonaws.services.connect.inappcalling.sample.common.showGeneralErrorAlert
import com.amazonaws.services.connect.inappcalling.sample.ui.controlpanel.ControlPanel
import com.amazonaws.services.connect.inappcalling.sample.ui.dtmf.DTMFSheet
import com.amazonaws.services.connect.inappcalling.sample.ui.utils.PermissionHelper
import com.amazonaws.services.connect.inappcalling.sample.ui.utils.ViewModelFactory
import com.amazonaws.services.connect.inappcalling.sample.common.visible
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallError
import com.amazonaws.services.connect.inappcalling.sample.data.utils.Transient
import com.amazonaws.services.connect.inappcalling.sample.ui.controlpanel.preferences.PreferencesSheet
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.snackbar.Snackbar

class CallSheet : BaseBottomSheetFragment() {

    companion object {
        const val TAG = "CallSheet"
    }

    private lateinit var controlPanel: ControlPanel
    private lateinit var viewModel: CallSheetViewModel
    private lateinit var sheetBinding: CallSheetBinding
    private lateinit var beforeCallBinding: CallSheetContentBeforeCallBinding
    private lateinit var callingBinding: CallSheetContentCallingBinding
    private lateinit var inCallBinding: CallSheetContentInCallBinding
    private lateinit var reconnectingSnackbar: Snackbar
    private lateinit var layoutByCallState: Map<Set<CallState>, View>

    private lateinit var audioPermissionRequestLauncher: ActivityResultLauncher<Array<String>>
    private lateinit var videoPermissionRequestLauncher: ActivityResultLauncher<Array<String>>

    private var deviceDialog: androidx.appcompat.app.AlertDialog? = null
    private var deviceListAdapter: DeviceAdapter? = null
    override fun onAttach(context: Context) {
        super.onAttach(context)
        audioPermissionRequestLauncher =
            PermissionHelper.registerForAudioPermissionResult(
                this,
                context
            ) { viewModel.startCall() }
        videoPermissionRequestLauncher =
            PermissionHelper.registerForVideoPermissionResult(
                this,
                context
            ) { viewModel.toggleLocalVideo() }
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        Log.i(TAG, "Creating View Model")
        configureRootLayout(view)
    }

    private fun configureRootLayout(view: View) {
        sheetBinding = CallSheetBinding.bind(view)
        sheetBinding.callSheetTitle.text = getString(R.string.call_sheet_header_text)
        sheetBinding.callSheetMinimizeButton.setOnClickListener {
            dismiss()
        }
        layoutByCallState = mapOf(
            setOf(CallState.NOT_STARTED) to sheetBinding.beforeCallContent.root,
            setOf(CallState.CALLING) to sheetBinding.callingContent.root,
            setOf(CallState.IN_CALL, CallState.RECONNECTING) to sheetBinding.inCallContent.root
        )
        reconnectingSnackbar = Snackbar.make(
            view,
            R.string.call_sheet_reconnecting_text,
            Snackbar.LENGTH_INDEFINITE
        )
        viewModel.callState.observe(this, ::handleCallStateChange)
        viewModel.error.observe(this, ::handleCallError)
    }

    private fun configureBeforeCallLayout(view: View) {
        beforeCallBinding = CallSheetContentBeforeCallBinding.bind(view)
        sheetBinding.callSheetMinimizeButton.visible()
        beforeCallBinding.callButtonDescription.text =
            getString(R.string.call_sheet_call_text)
        beforeCallBinding.callButton.contentDescription =
            getString(R.string.call_sheet_call_text)
        beforeCallBinding.callButton.setOnClickListener {
            startCall()
        }
    }

    private fun configureCallingLayout(view: View) {
        callingBinding = CallSheetContentCallingBinding.bind(view)
        sheetBinding.callSheetMinimizeButton.gone()
    }

    private fun configureInCallLayout(view: View) {
        inCallBinding = CallSheetContentInCallBinding.bind(view)
        sheetBinding.callSheetMinimizeButton.gone()
        controlPanel = ControlPanel(inCallBinding.controlPanel)

        controlPanel.initMuteButton { viewModel.toggleMute() }

        controlPanel.initKeypadButton {
            DTMFSheet().show(childFragmentManager, DTMFSheet.TAG)
        }

        viewModel.getActiveAudioDevice()?.let { controlPanel.updateDeviceButton(it) }
        controlPanel.initDeviceButton {
            setupAudioDeviceSelectionDialog()
            deviceDialog?.show()
        }


        controlPanel.initVideoButton {
            PermissionHelper.mayRequestVideoPermission(
                videoPermissionRequestLauncher, context
            ) { viewModel.toggleLocalVideo() }
        }

        controlPanel.initPreferencesButton {
            PreferencesSheet().show(childFragmentManager, PreferencesSheet.TAG)
        }
        inCallBinding.videoPanel.cameraSwitchButton.setOnClickListener {
            viewModel.switchCamera()
            inCallBinding.videoPanel.localVideoRenderView.mirror = viewModel.isUsingFrontCamera()
        }
        inCallBinding.endButton.setOnClickListener { endCall() }

        viewModel.localCallerMuted.observe(this, ::handleLocalCallerMuteChange)
        viewModel.activeDevice.observe(this, ::handleActiveDeviceChange)
        viewModel.localVideoState.observe(this, ::handleCallerVideoChange)
        viewModel.remoteVideoState.observe(this, ::handleCallerVideoChange)
    }

    private fun handleCallerVideoChange(state: CallerVideoState) {
        if (state.on) {
            addVideoTile(state.caller.isLocal)
        } else {
            removeVideoTile(state.caller.isLocal)
        }
    }

    private fun addVideoTile(isLocal: Boolean) {
        inCallBinding.videoPanel.root.visible()
        if (isLocal) {
            viewModel.bindVideoView(inCallBinding.videoPanel.localVideoRenderView, true)
            controlPanel.updateVideoButton(true)
            inCallBinding.videoPanel.localVideoTile.visible()
            inCallBinding.videoPanel.localVideoRenderView.visible()
            inCallBinding.videoPanel.localVideoRenderView.setZOrderMediaOverlay(true)
            inCallBinding.videoPanel.localVideoRenderView.mirror = viewModel.isUsingFrontCamera()
        } else {
            viewModel.bindVideoView(inCallBinding.videoPanel.remoteVideoRenderView, false)
            inCallBinding.videoPanel.remoteVideoRenderView.visible()
        }
    }

    private fun removeVideoTile(isLocal: Boolean) {
        viewModel.unbindVideoView(isLocal)
        if (isLocal) {
            controlPanel.updateVideoButton(false)
            inCallBinding.videoPanel.localVideoTile.gone()
            // Pixel devices having issue to hide the video view from parent view
            // https://sim.amazon.com/issues/WTBugs-28346
            inCallBinding.videoPanel.localVideoRenderView.gone()
        } else {
            inCallBinding.videoPanel.remoteVideoRenderView.gone()
        }
        mayCloseVideoPanel()
    }

    private fun mayCloseVideoPanel() {
        if (viewModel.isLocalVideoOn() || viewModel.isRemoteVideoOn()) return

        inCallBinding.videoPanel.root.gone()
    }

    private fun handleCallStateChange(state: CallState) {
        when (state) {
            CallState.NOT_STARTED -> view?.let { configureBeforeCallLayout(it) }
            CallState.CALLING -> view?.let { configureCallingLayout(it) }
            CallState.IN_CALL, CallState.RECONNECTING -> view?.let { configureInCallLayout(it) }
        }
        handleReconnection(state == CallState.RECONNECTING)
        switchLayoutForCallState(state)
    }

    private fun switchLayoutForCallState(state: CallState) {
        if (layoutByCallState.keys.none { it.contains(state) }) return
        layoutByCallState.forEach { (callStates, view) ->
            if (callStates.contains(state)) view.visible() else view.gone()
        }
    }

    private fun handleLocalCallerMuteChange(toMuted: Boolean) =
        controlPanel.updateMuteButton(toMuted)

    private fun handleActiveDeviceChange(device: MediaDevice?) =
        device?.let {
            controlPanel.updateDeviceButton(it)
            deviceListAdapter?.notifyDataSetChanged()
        }

    private fun endCall() {
        removeVideoTile(true)
        removeVideoTile(false)
        viewModel.endCall()
        dismiss()
    }

    private fun handleReconnection(isReconnecting: Boolean) {
        if (isReconnecting) reconnectingSnackbar.show() else reconnectingSnackbar.dismiss()
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? = inflater.inflate(R.layout.call_sheet, container, false)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val serviceLocator =  (activity?.application as ServiceLocatorProvider).getServiceLocator()
        viewModel = ViewModelProvider(
            this,
            ViewModelFactory(
                serviceLocator.callManager,
                serviceLocator.callStateRepo
            )
        )[CallSheetViewModel::class.java]

        if (viewModel.callState.value == CallState.NOT_STARTED) startCall()
    }

    override fun onDestroy() {
        endCall()
        super.onDestroy()
    }

    private fun startCall() {
        PermissionHelper.mayRequestAudioPermission(
            audioPermissionRequestLauncher, context
        ) { viewModel.startCall() }
    }

    private fun handleCallError(error: Transient<CallError>) {
        context?.showGeneralErrorAlert(error.get()?.message)
    }

    private fun setupAudioDeviceSelectionDialog() {
        val currentMediaDevices =
            viewModel.listAudioDevices().filter { device -> device.type != MediaDeviceType.OTHER }
        deviceListAdapter = DeviceAdapter(
            requireContext(),
            android.R.layout.simple_list_item_1,
            currentMediaDevices,
            viewModel
        )
        context?.let {
            deviceDialog = MaterialAlertDialogBuilder(it)
                .setTitle(it.getString(R.string.call_sheet_device_button_content))
                .setNegativeButton(R.string.call_sheet_device_dialog_cancel_button_text) { dialog, _ ->
                    dialog.dismiss()
                }
                .setAdapter(deviceListAdapter) { _, which ->
                    run {
                        viewModel.chooseAudioDevice(currentMediaDevices[which])
                    }
                }.create()
        }
    }
    private class DeviceAdapter(
        context: Context,
        resource: Int,
        private val devices: List<MediaDevice>,
        private val viewModel: CallSheetViewModel,
    ) : ArrayAdapter<MediaDevice>(context, resource, devices) {
        override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
            val view = super.getView(position, convertView, parent) as TextView
            view.contentDescription = devices[position].type.name
            val currentDevice = viewModel.getActiveAudioDevice()
            view.text =
                if (currentDevice?.type == devices[position].type) "${devices[position]} ✓" else devices[position].toString()
            return view
        }
    }
}
