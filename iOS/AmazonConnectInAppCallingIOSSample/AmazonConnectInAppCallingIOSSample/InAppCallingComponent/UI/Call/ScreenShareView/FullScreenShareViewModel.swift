//
//  FullScreenShareViewModel.swift
//  AmazonConnectInAppCallingIOSSample
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation
import AmazonChimeSDK

class FullScreenShareViewModel {

    private let callManager: CallManager
    private let callStateStore: CallStateStore

    var screenShareStatus: ScreenShareStatus {
        return self.callStateStore.screenShareStatus
    }

    init(callManager: CallManager,
         callStateStore: CallStateStore) {
        self.callManager = callManager
        self.callStateStore = callStateStore
    }

    func bindScreenShareView(videoView: DefaultVideoRenderView) {
        if screenShareStatus == .local {
            self.callManager.bindLocalScreenShareSink(videoSink: videoView)
        } else if screenShareStatus == .remote {
            if let screenShareTileState = callStateStore.screenShareTileState {
                self.callManager.bindVideoView(videoView, screenShareTileState)
            }
        }
    }

    func unbindScreenShareView(videoView: DefaultVideoRenderView) {
        if screenShareStatus == .local {
            self.callManager.unbindLocalScreenShareSink(videoSink: videoView)
        }
    }
}
