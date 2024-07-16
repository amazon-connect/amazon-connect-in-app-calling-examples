//
//  ScreenShare.swift
//  AmazonConnectInAppCallingIOSSample
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation
import AmazonChimeSDK

protocol ScreenShare: AnyObject {
    
    func startScreenShare()
    
    func stopScreenShare()
    
    func addVideoSink(_ videoSink: VideoSink)
    
    func removeVideoSink(_ videoSink: VideoSink)
}
