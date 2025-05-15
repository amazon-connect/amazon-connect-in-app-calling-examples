/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample.ui

import android.app.Dialog
import android.os.Bundle
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import com.google.android.material.bottomsheet.BottomSheetBehavior
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.google.android.material.bottomsheet.BottomSheetDialogFragment

open class BaseBottomSheetFragment(
    private val isFullHeight: Boolean = false
) : BottomSheetDialogFragment() {
    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        return context?.let {
            // Set color theme
            val dialog = BottomSheetDialog(it, com.google.android.material.R.style.Theme_Material3_Light_BottomSheetDialog)

            dialog.setOnShowListener {
                dialog.findViewById<FrameLayout>(com.google.android.material.R.id.design_bottom_sheet)
                    ?.let { frameLayout ->
                        val behaviour = BottomSheetBehavior.from(frameLayout)
                        if (isFullHeight) setupFullHeight(frameLayout)
                        behaviour.state = BottomSheetBehavior.STATE_EXPANDED
                        behaviour.isDraggable = false
                    }

            }
            dialog.setCanceledOnTouchOutside(false)
            dialog
        } ?: super.onCreateDialog(savedInstanceState) as BottomSheetDialog
    }

    private fun setupFullHeight(bottomSheet: View) {
        val layoutParams = bottomSheet.layoutParams
        layoutParams.height = WindowManager.LayoutParams.MATCH_PARENT
        bottomSheet.layoutParams = layoutParams
    }
}
