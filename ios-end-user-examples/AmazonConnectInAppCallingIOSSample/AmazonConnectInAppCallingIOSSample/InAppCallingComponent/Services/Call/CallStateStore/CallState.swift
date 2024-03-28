//
//  CallState.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

enum CallState {
    
    // Call is not started
    case notStarted
    
    // Call is connecting
    case calling
    
    // Call is connected
    case inCall
    
    // When user ends the call during "calling" state
    case cancelling
    
    // When meeting sesssion tries to reconnect during `inCall` state
    case reconnecting
}
