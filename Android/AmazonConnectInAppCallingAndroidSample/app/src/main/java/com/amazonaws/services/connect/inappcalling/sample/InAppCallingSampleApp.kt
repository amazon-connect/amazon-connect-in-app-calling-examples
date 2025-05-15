/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.connect.inappcalling.sample

import android.app.Application

class InAppCallingSampleApp : Application(), ServiceLocatorProvider {
    private lateinit var serviceLocator: ServiceLocator

    override fun getServiceLocator(): ServiceLocator {
        return serviceLocator
    }

    override fun updateServiceLocator(newServiceLocator: ServiceLocator) {
        serviceLocator = newServiceLocator
    }
}
