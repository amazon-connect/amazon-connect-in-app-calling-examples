//
//  PrefViewModel.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

class PrefViewModel {
    
    var isVfEnabled: Bool {
        get {
            return self.callStateStore.isVoiceFocusEnabled
        }
        set {
            if newValue != self.isVfEnabled {
                self.callManager.setVoiceFocusEnabled(newValue)
            }
        }
    }
    
    var bgBlurStrength: BackgroundBlurState? {
        return self.callStateStore.bgBlurState
    }
    
    private let callManager: CallManager
    private let callStateStore: CallStateStore
    
    init(callManager: CallManager,
         callStateStore: CallStateStore) {
        self.callManager = callManager
        self.callStateStore = callStateStore
    }
    
    func setBgBlurStrength(_ strength: BackgroundBlurState) {
        self.callManager.turnOnBGBlur(strength)
    }
}
