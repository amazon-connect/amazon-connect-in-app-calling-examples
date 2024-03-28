//
//  CallObserver.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

protocol CallObserver: AnyObject {
    
    func callStateDidUpdate(_ oldState: CallState,
                            _ newState: CallState)
    
    func callErrorDidOccur(_ error: Error)
    
    func muteStateDidUpdate()
    
    func videoTileStateDidAdd()
    
    func videoTileStateDidRemove()
}
