//
//  FullScreenShareViewController.swift
//  AmazonConnectInAppCallingIOSSample
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit

protocol FullScreenShareViewControllerDelegate: AnyObject {
    
    func willDismiss(sender: FullScreenShareViewController)
}

class FullScreenShareViewController: UIViewController {

    @IBOutlet weak var screenShareView: ScreenShareView!
    
    private let callNtfCenter: CallNotificationCenter
    private let vm: FullScreenShareViewModel
    @IBOutlet weak var closeButton: UIButton!
    
    weak var delegate: FullScreenShareViewControllerDelegate?
    
    public init() {
        let serviceProvider = InAppCalling.serviceProvider!
        self.callNtfCenter = serviceProvider.callNtfCenter
        self.vm = FullScreenShareViewModel(callManager: serviceProvider.callManager,
                                           callStateStore: serviceProvider.callStateStore)
        super.init(nibName: "FullScreenShareViewController", bundle: Bundle.main)
        self.initController()
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) is not allowed")
    }
    
    private func initController() {
        self.callNtfCenter.addObserver(self)
        self.modalPresentationStyle = .fullScreen
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.screenShareView.hideFullScreenButton()
        self.closeButton.setTitle("", for: .normal)
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        self.updateScreenShareRenderView()
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        self.vm.unbindScreenShareView(videoView: self.screenShareView.screenShareRenderView)
        self.delegate?.willDismiss(sender: self)
    }

    private func updateScreenShareRenderView() {
        switch self.vm.screenShareStatus {
        case .local, .remote:
            self.vm.bindScreenShareView(videoView: self.screenShareView.screenShareRenderView)
            let senderName = self.vm.screenShareStatus == ScreenShareStatus.local ? "you" : "agent"
            self.screenShareView.senderLabel.text = "Screen share: \(senderName)"
        case .none:
            self.vm.unbindScreenShareView(videoView: self.screenShareView.screenShareRenderView)
            self.screenShareView.senderLabel.text = nil
        }
    }
    
    @IBAction func closeButtonPressed(_ sender: Any) {
        self.dismiss(animated: true)
    }
    
}

extension FullScreenShareViewController: CallObserver {
    func callStateDidUpdate(_ oldState: CallState, 
                            _ newState: CallState) {
        if newState == .notStarted {
            self.dismiss(animated: false)
        }
    }
    
    func callErrorDidOccur(_ error: any Error) {}
    
    func muteStateDidUpdate() {}
    
    func videoTileStateDidAdd() {}
    
    func videoTileStateDidRemove() {}
    
    func screenShareCapabilityDidUpdate() {}
    
    func screenShareStatusDidUpdate() {
        updateScreenShareRenderView()
    }
    
    func messageDidUpdate(_ message: String?) {}
    
}
