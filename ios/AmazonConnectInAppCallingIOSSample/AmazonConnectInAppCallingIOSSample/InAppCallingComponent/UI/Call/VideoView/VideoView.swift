//
//  VideoView.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit
import AmazonChimeSDK

@IBDesignable
class VideoView: UIView {
    
    @IBOutlet private weak var localVideoContainer: UIView!
    @IBOutlet private weak var localVideoView: DefaultVideoRenderView!
    @IBOutlet private weak var remoteVideoView: DefaultVideoRenderView!
    @IBOutlet private weak var remoteVideoPlaceHolderImageView: UIImageView!
    
    private let vm: VideoViewModel
    private let callNtfCenter: CallNotificationCenter
    
    override init(frame: CGRect) {
        let (callNtfCenter, vm) = Self.commonInit()
        self.vm = vm
        self.callNtfCenter = callNtfCenter
        super.init(frame: frame)
        initView()
    }
    
    required init?(coder: NSCoder) {
        let (callNtfCenter, vm) = Self.commonInit()
        self.vm = vm
        self.callNtfCenter = callNtfCenter
        super.init(coder: coder)
        initView()
    }
    
    private static func commonInit() -> (CallNotificationCenter, VideoViewModel) {
        let serviceProvider = InAppCalling.serviceProvider!
        let vm = VideoViewModel(callManager: serviceProvider.callManager,
                                callStateStore: serviceProvider.callStateStore)
        let callNtfCenter = serviceProvider.callNtfCenter
        return (callNtfCenter, vm)
    }
    
    private func initView() {
        self.callNtfCenter.addObserver(self)
        
        self.loadView("VideoView")
        
        self.setupUI()
        
        self.updateUI()
    }
    
    @IBAction func localVideoContainerTapped(_ sender: Any) {
        self.vm.switchCamera()
    }
    
}

// UI Manipulation
extension VideoView {
    
    private func setupUI() {
        self.setupLocalVideo()
    }
    
    private func setupLocalVideo() {
        self.localVideoContainer.clipsToBounds = true
        self.localVideoContainer.layer.cornerRadius = 8
    }
    
    private func updateUI() {
        self.updateLocalVideoUI()
        self.updateRemoteVideoUI()
    }
    
    private func updateLocalVideoUI() {
        self.localVideoContainer.isHidden = !self.vm.isLocalVideoOn
        || !self.vm.isLocalVideoOn
        if self.vm.isLocalVideoOn {
            self.vm.bindLocalVideoView(self.localVideoView)
        }
    }
    
    private func updateRemoteVideoUI() {
        self.remoteVideoPlaceHolderImageView.isHidden = self.vm.isRemoteVideoOn
        if self.vm.isRemoteVideoOn {
            self.vm.bindRemoteVideoView(self.remoteVideoView)
        }
        self.remoteVideoView.isHidden = !self.vm.isRemoteVideoOn
    }
}

// VideoViewModelDelegate
extension VideoView: CallObserver {
    
    func callStateDidUpdate(_ oldState: CallState,
                            _ newState: CallState) {}
    
    func callErrorDidOccur(_ error: Error) {}
    
    func muteStateDidUpdate() {}
    
    func videoTileStateDidAdd() {
        DispatchQueue.main.async {
            self.updateUI()
        }
    }
    
    func videoTileStateDidRemove() {
        DispatchQueue.main.async {
            self.updateUI()
        }
    }
}
