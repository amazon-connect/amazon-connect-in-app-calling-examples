//
//  CallNotificationCenter.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

class CallNotificationCenter {
    
    private var callObservers = [CallObserverWeakReference]()
    
    func addObserver(_ observer: CallObserver) {
        for currentObserver in callObservers where currentObserver.value === observer {
            return
        }
        let weakObserver = CallObserverWeakReference(observer)
        self.callObservers.append(weakObserver)
    }
    
    func removeObserver(_ observer: CallObserver) {
        self.callObservers.removeAll { $0.value === observer}
    }
    
    func notifyCallStateUpdate(_ oldState: CallState,
                               _ newState: CallState) {
        for observer in callObservers {
            observer.value?.callStateDidUpdate(oldState, newState)
        }
    }
    
    func notifyVideoTileStateDidAdd() {
        for observer in callObservers {
            observer.value?.videoTileStateDidAdd()
        }
    }
    
    func notifyVideoTileStateDidRemove() {
        for observer in callObservers {
            observer.value?.videoTileStateDidRemove()
        }
    }
    
    func notifyMuteStateUpdate(_ muteStates: [String: Bool]) {
        for observer in callObservers {
            observer.value?.muteStateDidUpdate()
        }
    }
    
    func notifyCallErrorOccur(_ error: Error) {
        for observer in callObservers {
            observer.value?.callErrorDidOccur(error)
        }
    }
    
    func notifyMessageUpdate(_ message: String?) {
        for observer in callObservers {
            observer.value?.messageDidUpdate(message)
        }
    }
    
    func notifyScreenShareCapabilityUpdate(_ enabled: Bool) {
        for observer in callObservers {
            observer.value?.screenShareCapabilityDidUpdate()
        }
    }
    
    func notifyScreenShareStatusUpdate(_ status: ScreenShareStatus) {
        for observer in callObservers {
            observer.value?.screenShareStatusDidUpdate()
        }
    }
}
