//
//  CallViewController.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit
import AVFAudio

public class CallViewController: UIViewController {

    @IBOutlet weak var overlayView: UIView!
    @IBOutlet weak var contentScrollView: UIScrollView!
    @IBOutlet weak var callContentView: UIView!
    @IBOutlet weak var titleView: TitleView!
    @IBOutlet weak var inlineErrorView: CallInlineErrorView!
    @IBOutlet weak var videoContainerView: UIView!
    @IBOutlet weak var videoView: VideoView!
    @IBOutlet weak var actionPanelContainerView: UIView!
    @IBOutlet private weak var actionPanelContentView: ActionPanelView!
    @IBOutlet weak var callButton: ControlButton!
    
    // Constraints for hiding a section
    @IBOutlet weak var inlineErrorViewHeightConstraint: NSLayoutConstraint!
    @IBOutlet weak var videoContainerZeroHeightConstraint: NSLayoutConstraint!
    @IBOutlet weak var actionPanelContainerZeroHeightConstraint: NSLayoutConstraint!
    
    private let callNtfCenter: CallNotificationCenter
    
    private let vm: CallViewModel
    private lazy var dtmfView: DTMFView = {
        return DTMFView(controller: self)
    }()
    
    public init() {
        let serviceProvider = InAppCalling.serviceProvider!
        self.callNtfCenter = serviceProvider.callNtfCenter
        self.vm = CallViewModel(callController: serviceProvider.callController,
                                dtmfSender: serviceProvider.dtmfSender,
                                callStateStore: serviceProvider.callStateStore)
        super.init(nibName: "CallViewController", bundle: Bundle.main)
        self.initController()
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) is not allowed")
    }

    private func initController() {
        self.callNtfCenter.addObserver(self)
        self.modalPresentationStyle = .pageSheet
    }
    
    private func startCall() {
        self.vm.call()
    }
}

// Controller lifecycle
extension CallViewController {

    public override func viewDidLoad() {
        super.viewDidLoad()
        self.setupUI()
        self.updateUI()
    }
    
    public override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        if self.isBeingPresented {
            self.startCall()
        }
    }
    
    public override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        self.view.endEditing(true)
    }
    
    // Custom keyboard input view
    public override var inputAccessoryView: UIView? {
        return dtmfView.canBecomeFirstResponder ? dtmfView: nil
    }
    
    public override var canBecomeFirstResponder: Bool {
        return dtmfView.canBecomeFirstResponder
    }
}

// UI Manipulation
extension CallViewController {
    
    // One-time UI setup
    private func setupUI() {
        self.isModalInPresentation = true
        self.contentScrollView.contentInsetAdjustmentBehavior = .never
        
        self.contentScrollView.clipsToBounds = true
        self.contentScrollView.layer.cornerRadius = 24
        self.contentScrollView.layer.maskedCorners = [.layerMaxXMinYCorner, .layerMinXMinYCorner]
        
        self.titleView.title = String.defaultHeaderTitle
        self.titleView.actionButtonImage = Bundle.Images.minimize
        self.titleView.delegate = self
        
        self.actionPanelContentView.delegate = self
    }
    
    // UI updates when events occur
    private func updateUI() {
        self.updateTitleView()
        self.updateErrorView()
        self.updateVideoContainerView()
        self.updateActionPanel()
        self.updateCallButton()
    }
    
    private func updateTitleView() {
        self.titleView.title = String.defaultHeaderTitle
        self.titleView.backgroundColor = UIColor.headerViewBGColor
        self.titleView.setMinimizeButtonHidden(isHidden: self.vm.callState != .notStarted)
    }
    
    private func updateErrorView() {
        self.inlineErrorViewHeightConstraint.priority = (self.vm.callState == .reconnecting) ?
            .defaultLow : .required
    }
    
    private func updateVideoContainerView() {
        if (self.vm.callState == .inCall || self.vm.callState == .reconnecting)
            && (self.vm.isLocalVideoOn || self.vm.isRemoteVideoOn) {
            self.videoContainerView.isHidden = false
            self.videoContainerZeroHeightConstraint.priority = .defaultLow
        } else {
            self.videoContainerView.isHidden = true
            self.videoContainerZeroHeightConstraint.priority = .required
        }
    }
    
    private func updateActionPanel() {
        if self.vm.callState == .inCall || self.vm.callState == .reconnecting {
            self.actionPanelContainerView.isHidden = false
            self.actionPanelContainerZeroHeightConstraint.priority = .defaultLow
        } else {
            self.actionPanelContainerView.isHidden = true
            self.actionPanelContainerZeroHeightConstraint.priority = .required
        }
    }

    private func updateCallButton() {
        UIView.animate(withDuration: 0.3) {
            switch self.vm.callState {
            case .notStarted:
                self.callButton.title = String.defaultCallButtonTitle
                self.callButton.imageBackgroundColor = .callButtonGreen
                self.callButton.image = Bundle.Images.startCall
                self.callButton.isEnabled = true
            case .calling:
                self.callButton.title = String.calling
                self.callButton.imageBackgroundColor = .callButtonRed
                self.callButton.image = Bundle.Images.endCall
                self.callButton.isEnabled = true
            case .inCall, .reconnecting:
                self.callButton.title = String.end
                self.callButton.imageBackgroundColor = .callButtonRed
                self.callButton.image = Bundle.Images.endCall
                self.callButton.isEnabled = true
            case .cancelling:
                self.callButton.title = String.cancelling
                self.callButton.imageBackgroundColor = .callButtonRed
                self.callButton.image = Bundle.Images.endCall
                self.callButton.isEnabled = false
            }
        }
    }
}

// IBActions
extension CallViewController {
    
    @IBAction func overlayTapped(_ sender: Any) {
        self.dismiss(animated: true)
    }
    
    @IBAction func callButtonTapped(_ sender: Any) {
        switch self.vm.callState {
        case .notStarted: self.startCall()
        case .inCall, .reconnecting: self.vm.endCall()
        case .calling, .cancelling: break
        }
    }
}

// TitleViewDelegate
extension CallViewController: TitleViewDelegate {
    
    func actionButtonTapped(_ sender: Any) {
        self.dismiss(animated: true)
    }
}

// ViewModelDelegate
extension CallViewController: CallObserver {
    
    func callStateDidUpdate(_ oldState: CallState,
                            _ newState: CallState) {
        DispatchQueue.main.async {
            self.updateUI()
            if newState == .notStarted {
                self.dismiss(animated: true)
            }
        }
    }
    
    func callErrorDidOccur(_ error: Error) {
        DispatchQueue.main.async {
            self.showError(error)
        }
    }
    
    func muteStateDidUpdate() {
        DispatchQueue.main.async {
            self.updateUI()
        }
    }
    
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

// DTMFViewDelegate
extension CallViewController: DTMFViewDelegate {
    
    public func sendDidTap(_ sender: Any, _ data: String) {
        self.dtmfView.showSpinner()
        self.dtmfView.hideMessage()
        
        self.vm.sendDTMF(data) { error in
            
            DispatchQueue.main.async {
                self.dtmfView.hideSpinner()
                
                if let error = error {
                    self.dtmfView.showMessage(error.localizedDescription, false)
                } else {
                    self.dtmfView.showMessage(String.sent, true)
                    self.dtmfView.clearInputTextField()
                }
            }
        }
    }
}

// MARK: - ActionPanelViewDelegate
extension CallViewController: ActionPanelViewDelegate {
    func keypadButtonDidTap(_ sender: Any) {
        self.dtmfView.showKeyboard()
    }
    
    func preferencesButtonDidTap(_ sender: Any) {
        let controller = PrefViewController()
        self.presentInNavController(controller)
    }
}
