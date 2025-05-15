/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample

import android.content.Context

data class CallConfiguration(
    val applicationContext: Context,
    val connectInstanceId: String = "",
    val contactFlowId: String = "",
    val startWebrtcEndpoint: String = "",
    val createParticipantConnectionEndpoint: String = "",
    val sendMessageEndpoint: String = "",
    val displayName: String,
    val attributes: Map<String, String>
)
