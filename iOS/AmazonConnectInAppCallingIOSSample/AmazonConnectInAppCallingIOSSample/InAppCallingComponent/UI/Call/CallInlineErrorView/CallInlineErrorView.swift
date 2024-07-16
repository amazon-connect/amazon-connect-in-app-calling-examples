//
//  CallInlineErrorView.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit

@IBDesignable
class CallInlineErrorView: UIView {
    
    @IBOutlet private weak var label: PaddingLabel!
    
    @IBOutlet private weak var heightConstraint: NSLayoutConstraint!
    
    private let vm: CallInlineErrorViewModel
    private let callNtfCenter: CallNotificationCenter
    private let verticalPadding: CGFloat = 8
    
    override init(frame: CGRect) {
        let (callNtfCenter, vm) = Self.commonInit()
        self.callNtfCenter = callNtfCenter
        self.vm = vm
        super.init(frame: frame)
        initView()
    }
    
    required init?(coder: NSCoder) {
        let (callNtfCenter, vm) = Self.commonInit()
        self.callNtfCenter = callNtfCenter
        self.vm = vm
        super.init(coder: coder)
        initView()
    }
    
    private static func commonInit() -> (CallNotificationCenter, CallInlineErrorViewModel) {
        let serviceProvider = InAppCalling.serviceProvider!
        let callNtfCenter = serviceProvider.callNtfCenter
        let callStateStore = serviceProvider.callStateStore
        let vm = CallInlineErrorViewModel(callStateStore: callStateStore)
        return (callNtfCenter, vm)
    }
    
    private func initView() {
        self.loadView("CallInlineErrorView")
        
        self.label.textColor = .errorViewTextColor
        self.label.backgroundColor = .errorViewBGColor
        
        self.callNtfCenter.addObserver(self)
        
        updateUI()
    }
    
    private func updateUI() {
        if self.vm.callState == .reconnecting {
            self.label.text = .reconnectingDisplayText
            self.isHidden = false
            self.heightConstraint.constant = self.verticalPadding * 2
        } else {
            self.label.text = nil
            self.isHidden = true
            self.heightConstraint.constant = 0
        }
    }
}

extension CallInlineErrorView: CallObserver {
    func screenShareCapabilityDidUpdate() {}
    
    func screenShareStatusDidUpdate() {}
    
    func callStateDidUpdate(_ oldState: CallState,
                            _ newState: CallState) {
        DispatchQueue.main.async {
            self.updateUI()
        }
    }
    
    func callErrorDidOccur(_ error: Error) {}
    
    func muteStateDidUpdate() {}
    
    func videoTileStateDidAdd() {}
    
    func videoTileStateDidRemove() {}
    
    func messageDidUpdate(_ message: String?) {}
}
