//
//  InAppScreenShare.swift
//  AmazonConnectInAppCallingIOSSample
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation
import AmazonChimeSDK

class InAppScreenShare: ScreenShare {
    
    private let logger = ConsoleLogger(name: "InAppScreenCaptureModel")
    private let contentShareController: ContentShareController
    
    weak var delegate: ScreenShareDelegate?

    let inAppScreenCaptureSource: VideoCaptureSource

    init(contentShareController: ContentShareController) {
        self.inAppScreenCaptureSource = InAppScreenCaptureSource(logger: logger)
        self.contentShareController = contentShareController
        self.contentShareController.addContentShareObserver(observer: self)
    }
    
    func startScreenShare() {
        inAppScreenCaptureSource.addCaptureSourceObserver(observer: self)
        inAppScreenCaptureSource.start()
    }
    
    func stopScreenShare() {
        inAppScreenCaptureSource.stop()
    }
    
    func addVideoSink(_ videoSink: VideoSink) {
        self.inAppScreenCaptureSource.addVideoSink(sink: videoSink)
    }
    
    func removeVideoSink(_ videoSink: VideoSink) {
        self.inAppScreenCaptureSource.removeVideoSink(sink: videoSink)
    }
}

extension InAppScreenShare: CaptureSourceObserver {
    func captureDidStart() {
        logger.info(msg: "InAppScreenCaptureSource did start")
        let contentShareSource = ContentShareSource()
        contentShareSource.videoSource = inAppScreenCaptureSource
        contentShareController.startContentShare(source: contentShareSource)
    }

    func captureDidStop() {
        logger.info(msg: "InAppScreenCaptureSource did stop")
        contentShareController.stopContentShare()
        inAppScreenCaptureSource.removeCaptureSourceObserver(observer: self)
    }

    func captureDidFail(error: CaptureSourceError) {
        logger.error(msg: "InAppScreenCaptureSource did fail: \(error.description)")
        inAppScreenCaptureSource.stop()
        contentShareController.stopContentShare()
        inAppScreenCaptureSource.removeCaptureSourceObserver(observer: self)
        self.delegate?.screenShareDidFail()
    }
}

extension InAppScreenShare: ContentShareObserver {
    func contentShareDidStart() {
        logger.info(msg: "InAppScreenCaptureSource: contentShareDidStart")
        self.delegate?.screenShareDidStart()
    }

    func contentShareDidStop(status: ContentShareStatus) {
        logger.info(msg: "InAppScreenCaptureSource: contentShareDidStop")
        self.delegate?.screenShareDidStop()
    }
}
