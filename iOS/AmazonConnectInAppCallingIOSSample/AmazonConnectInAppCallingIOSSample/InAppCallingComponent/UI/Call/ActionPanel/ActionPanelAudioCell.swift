//
//  ActionPanelAudioCell.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit
import AVKit

protocol ActionPanelAudioCellDelegate: AnyObject {
    
    func selectAudioDeviceDidFinish(_ sender: Any)
}

class ActionPanelAudioCell: ActionPanelCell {
    
    weak var delegate: ActionPanelAudioCellDelegate?
    
    private let routePickerView = AVRoutePickerView()
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        self.initView()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        self.initView()
    }
    
    private func initView() {
        self.routePickerView.translatesAutoresizingMaskIntoConstraints = false
        self.addSubview(self.routePickerView)
        self.routePickerView.delegate = self
        self.routePickerView.widthAnchor.constraint(equalTo: self.widthAnchor).isActive = true
        self.routePickerView.heightAnchor.constraint(equalTo: self.heightAnchor).isActive = true
        self.routePickerView.centerXAnchor.constraint(equalTo: self.centerXAnchor).isActive = true
        self.routePickerView.centerYAnchor.constraint(equalTo: self.centerYAnchor).isActive = true
        self.routePickerView.layer.zPosition = -1
    }
}

extension ActionPanelAudioCell: AVRoutePickerViewDelegate {
    
    func routePickerViewDidEndPresentingRoutes(_ routePickerView: AVRoutePickerView) {
        self.delegate?.selectAudioDeviceDidFinish(self)
    }
}
