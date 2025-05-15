//
//  ScreenShareDelegate.swift
//  AmazonConnectInAppCallingIOSSample
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

protocol ScreenShareDelegate: AnyObject {

    func screenShareDidStart()

    func screenShareDidStop()

    func screenShareDidFail()
}
