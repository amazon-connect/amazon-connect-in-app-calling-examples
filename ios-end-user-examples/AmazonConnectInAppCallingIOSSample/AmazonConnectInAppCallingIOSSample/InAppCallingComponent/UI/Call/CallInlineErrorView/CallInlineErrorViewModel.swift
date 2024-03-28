//
//  CallInlineErrorViewModel.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

class CallInlineErrorViewModel {
    
    var callState: CallState {
        return self.callStateStore.callState
    }
    
    private let callStateStore: CallStateStore
    
    init(callStateStore: CallStateStore) {
        self.callStateStore = callStateStore
    }
}
