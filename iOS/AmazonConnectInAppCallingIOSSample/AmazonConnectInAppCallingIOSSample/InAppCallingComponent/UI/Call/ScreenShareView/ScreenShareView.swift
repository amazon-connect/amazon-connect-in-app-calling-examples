//
//  ScreenShareView.swift
//  AmazonConnectInAppCallingIOSSample
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit
import AmazonChimeSDK

protocol ScreenShareViewDelegate: AnyObject {
    func fullScreenButtonPressed(sender: ScreenShareView)
}

@IBDesignable
class ScreenShareView: UIView {
    
    @IBOutlet weak var screenShareRenderView: DefaultVideoRenderView!
    @IBOutlet weak var senderLabel: PaddingLabel!
    @IBOutlet weak var fullScreenButton: UIButton!
    
    private let vm: ScreenShareViewModel
    private let callNtfCenter: CallNotificationCenter
    
    weak var delegate: ScreenShareViewDelegate?
    
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
    
    private static func commonInit() -> (CallNotificationCenter, ScreenShareViewModel) {
        let serviceProvider = InAppCalling.serviceProvider!
        let vm = ScreenShareViewModel(callManager: serviceProvider.callManager,
                                      callStateStore: serviceProvider.callStateStore)
        let callNtfCenter = serviceProvider.callNtfCenter
        return (callNtfCenter, vm)
    }
    
    private func initView() {
        self.callNtfCenter.addObserver(self)
        self.loadView("ScreenShareView")
        self.fullScreenButton.setTitle("", for: .normal)
        self.updateUI()
    }
    
    private func updateUI() {
        switch self.vm.screenShareStatus {
        case .local:
            self.vm.unbindRemoteScreenShareView()
            self.vm.bindLocalScreenShareView(videoRenderView: self.screenShareRenderView)
            self.senderLabel.text = "Screen share: you"
        case .remote:
            self.vm.unbindLocalScreenShareView(videoRenderView: self.screenShareRenderView)
            self.vm.bindRemoteScreenShareView(videoRenderView: self.screenShareRenderView)
            self.senderLabel.text = "Screen share: agent"
        case .none:
            self.vm.unbindLocalScreenShareView(videoRenderView: self.screenShareRenderView)
            self.vm.unbindRemoteScreenShareView()
            self.senderLabel.text = nil
        }
    }
    
    @IBAction func fullScreenButtonPressed(_ sender: Any) {
        self.delegate?.fullScreenButtonPressed(sender: self)
    }
    
    func hideFullScreenButton() {
        self.fullScreenButton.isHidden = true
    }
}

extension ScreenShareView: CallObserver {
    func screenShareCapabilityDidUpdate() {}
    
    func screenShareStatusDidUpdate() {
        DispatchQueue.main.async {
            self.screenShareRenderView.resetImage()
            self.updateUI()
        }
    }
    
    func callStateDidUpdate(_ oldState: CallState,
                            _ newState: CallState) {}
    
    func callErrorDidOccur(_ error: Error) {}
    
    func muteStateDidUpdate() {}
    
    func videoTileStateDidAdd() {
        DispatchQueue.main.async {
            self.updateUI()
        }
    }
    
    func videoTileStateDidRemove() {}
    
    func messageDidUpdate(_ message: String?) {}
}
