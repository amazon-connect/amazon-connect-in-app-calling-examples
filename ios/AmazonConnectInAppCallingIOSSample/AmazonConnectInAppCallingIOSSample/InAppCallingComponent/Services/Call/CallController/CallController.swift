//
//  CallController.swift
//  AmazonConnectInAppCallingIOSSample
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

protocol CallController: AnyObject {
    
    func startCall()
    
    func endCall()
    
    func setMute(_ isMuted: Bool)
    
    func startLocalVideo()
    
    func stopLocalVideo()
}
