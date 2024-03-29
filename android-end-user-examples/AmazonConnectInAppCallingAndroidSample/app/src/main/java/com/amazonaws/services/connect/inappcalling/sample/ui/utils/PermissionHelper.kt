/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample.ui.utils

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.annotation.RequiresApi
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallError
import com.amazonaws.services.connect.inappcalling.sample.common.showGeneralErrorAlert

/**
 * Helps check and request for permission to end user.
 *
 * registerFor*PermissionResult functions must be called at initialization
 * stage of the given [Fragment]. It returns a permission request launcher for later use.
 *
 * mayRequest*Permission can be called when necessary, along with
 * the launcher that generated from registration. It pops up system window for end user to interact.
 * It will go ahead execute onGranted callback when permission is granted, show alert dialog with
 * pre-defined error message when permission is denied.
 */
internal object PermissionHelper {
    private val baseAudioPermissions = arrayOf(
        Manifest.permission.MODIFY_AUDIO_SETTINGS,
        Manifest.permission.RECORD_AUDIO,
        Manifest.permission.CALL_PHONE,
        Manifest.permission.READ_PHONE_STATE
    )
    @RequiresApi(Build.VERSION_CODES.O)
    private val highOSAudioPermissions = arrayOf(
        Manifest.permission.MANAGE_OWN_CALLS
    )

    private val audioPermissions =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            baseAudioPermissions + highOSAudioPermissions
        } else {
            baseAudioPermissions
        }

    private val videoPermissions = arrayOf(Manifest.permission.CAMERA)

    fun registerForAudioPermissionResult(
        fragment: Fragment,
        context: Context?,
        onGranted: () -> Unit
    ): ActivityResultLauncher<Array<String>> =
        registerForPermissionResult(
            fragment, context, onGranted,
            CallError.FAIL_TO_GET_AUDIO_PERMISSION.message
        )

    fun registerForVideoPermissionResult(
        fragment: Fragment,
        context: Context?,
        onGranted: () -> Unit
    ): ActivityResultLauncher<Array<String>> =
        registerForPermissionResult(
            fragment, context, onGranted,
            CallError.FAIL_TO_GET_VIDEO_PERMISSION.message
        )

    private fun registerForPermissionResult(
        fragment: Fragment,
        context: Context?,
        onGranted: () -> Unit,
        message: String
    ): ActivityResultLauncher<Array<String>> =
        fragment.registerForActivityResult(
            ActivityResultContracts.RequestMultiplePermissions()
        ) { result ->
            val isGranted = result.values.all { it }
            if (isGranted) {
                onGranted.invoke()
            } else {
                context?.showGeneralErrorAlert(message)
            }
        }


    fun mayRequestAudioPermission(
        permissionRequestLauncher: ActivityResultLauncher<Array<String>>,
        context: Context?,
        onGranted: () -> Unit
    ) = mayRequestPermission(audioPermissions, permissionRequestLauncher, context, onGranted)

    fun mayRequestVideoPermission(
        permissionRequestLauncher: ActivityResultLauncher<Array<String>>,
        context: Context?,
        onGranted: () -> Unit
    ) = mayRequestPermission(videoPermissions, permissionRequestLauncher, context, onGranted)

    private fun mayRequestPermission(
        permissions: Array<String>,
        permissionRequestLauncher: ActivityResultLauncher<Array<String>>,
        context: Context?,
        onGranted: () -> Unit
    ) {
        when {
            permissions.all { permission ->
                context?.let {
                    ContextCompat.checkSelfPermission(
                        it,
                        permission
                    )
                } == PackageManager.PERMISSION_GRANTED
            } -> {
                // Permissions already granted
                onGranted.invoke()
            }
            else -> {
                // Request for permissions
                permissionRequestLauncher.launch(permissions)
            }
        }
    }
}