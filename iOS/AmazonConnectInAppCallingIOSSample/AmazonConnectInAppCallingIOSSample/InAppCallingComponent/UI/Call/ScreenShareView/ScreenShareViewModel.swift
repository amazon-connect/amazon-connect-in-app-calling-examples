//
//  ScreenShareViewModel.swift
//  AmazonConnectInAppCallingIOSSample
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation
import AmazonChimeSDK

class ScreenShareViewModel {

    var screenShareStatus: ScreenShareStatus {
        return self.callStateStore.screenShareStatus
    }

    private let callManager: CallManager
    private let callStateStore: CallStateStore

    init(callManager: CallManager,
         callStateStore: CallStateStore) {
        self.callManager = callManager
        self.callStateStore = callStateStore
    }

    func bindLocalScreenShareView(videoRenderView: DefaultVideoRenderView) {
        self.callManager.bindLocalScreenShareSink(videoSink: videoRenderView)
    }

    func unbindLocalScreenShareView(videoRenderView: DefaultVideoRenderView) {
         self.callManager.unbindLocalScreenShareSink(videoSink: videoRenderView)
    }

    func bindRemoteScreenShareView(videoRenderView: DefaultVideoRenderView) {
        if let tileState = self.callStateStore.screenShareTileState {
            self.callManager.bindVideoView(videoRenderView, tileState)
        }
    }
}

