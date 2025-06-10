/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample.ui.controlpanel

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import androidx.appcompat.content.res.AppCompatResources
import androidx.constraintlayout.widget.ConstraintLayout
import com.amazonaws.services.connect.inappcalling.sample.R
import com.amazonaws.services.connect.inappcalling.sample.databinding.CallSheetControlPanelButtonBinding

class ControlButton(
    context: Context,
    attrs: AttributeSet,
) : ConstraintLayout(context, attrs) {
    private val binding: CallSheetControlPanelButtonBinding

    init {
        val inflater = context.getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        val view = inflater.inflate(R.layout.call_sheet_control_panel_button, this)

        binding = CallSheetControlPanelButtonBinding.bind(view)
    }

    fun setButtonOnClickListener(listener: (View) -> Unit) {
        binding.imageButton.setOnClickListener { listener.invoke(it) }
    }

    fun setButtonImage(resId: Int) {
        binding.imageButton.setImageResource(resId)
    }

    fun setButtonBackgroundColor(resId: Int) {
        binding.imageButton.backgroundTintList = AppCompatResources.getColorStateList(context, resId)
    }

    fun setButtonContentDescription(resId: Int) {
        binding.imageButton.contentDescription = context.getString(resId)
    }

    fun setButtonContentDescription(text: String) {
        binding.imageButton.contentDescription = text
    }

    fun setDescriptionText(resId: Int) {
        binding.buttonDescription.text = context.getString(resId)
    }

    fun setDescriptionText(text: String) {
        binding.buttonDescription.text = text
    }
}
