//
//  VideoTileStateType.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation
import AmazonChimeSDK

enum VideoTileStateType {
    case local, remote, contentShare
    
    init(_ videoTileState: VideoTileState) {
        if videoTileState.isContent {
            self = .contentShare
        } else if videoTileState.isLocalTile {
            self = .local
        } else {
            self = .remote
        }
    }
}
