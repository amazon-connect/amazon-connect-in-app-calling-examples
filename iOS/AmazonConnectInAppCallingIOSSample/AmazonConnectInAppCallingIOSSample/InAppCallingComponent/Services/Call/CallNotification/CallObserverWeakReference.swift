//
//  CallObserverWeakReference.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

/// This class is for wrapping CallObserver as weak reference to prevent retain cycle
class CallObserverWeakReference {
    weak var value: CallObserver?

    init (_ value: CallObserver) {
      self.value = value
    }
}
