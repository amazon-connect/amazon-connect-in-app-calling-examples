//
//  BgBlurPickerViewModel.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

class BgBlurPickerViewModel {

    var bgBlurStrength: BackgroundBlurState {
        get {
            return self.callStateStore.bgBlurState ?? .off
        }
        set {
            self.callManager.turnOnBGBlur(newValue)
        }
    }

    private let callManager: CallManager
    private let callStateStore: CallStateStore

    init(callManager: CallManager, callStateStore: CallStateStore) {
        self.callManager = callManager
        self.callStateStore = callStateStore
    }
}
