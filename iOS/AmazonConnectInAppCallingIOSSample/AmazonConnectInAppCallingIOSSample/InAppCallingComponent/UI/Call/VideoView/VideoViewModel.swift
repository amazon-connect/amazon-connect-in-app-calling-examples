//
//  VideoViewModel.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation
import AmazonChimeSDK

class VideoViewModel {

    var isLocalVideoOn: Bool {
        return self.callStateStore.localVideoTileState != nil
    }

    var isRemoteVideoOn: Bool {
        return self.callStateStore.remoteVideoTileState != nil
    }

    var videoBGBlurState: BackgroundBlurState {
        self.callStateStore.bgBlurState ?? .off
    }

    private let callManager: CallManager
    private let callStateStore: CallStateStore

    init(callManager: CallManager,
         callStateStore: CallStateStore) {
        self.callManager = callManager
        self.callStateStore = callStateStore
    }

    func bindLocalVideoView(_ videoView: DefaultVideoRenderView) {
        if let localVideoTileState = self.callStateStore.localVideoTileState {
            self.bindVideoView(videoView, localVideoTileState)
        }
    }

    func bindRemoteVideoView(_ videoView: DefaultVideoRenderView) {
        if let remoteVideoTileState = self.callStateStore.remoteVideoTileState {
            self.bindVideoView(videoView, remoteVideoTileState)
        }
    }

    private func bindVideoView(_ videoView: DefaultVideoRenderView, _ tileState: VideoTileState) {
        self.callManager.bindVideoView(videoView, tileState)
    }

    func switchCamera() {
        self.callManager.switchCamera()
    }
}
