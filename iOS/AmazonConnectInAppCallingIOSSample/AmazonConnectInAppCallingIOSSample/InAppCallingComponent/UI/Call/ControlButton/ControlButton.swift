//
//  ControlButton.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit

@IBDesignable
class ControlButton: UIControl {

    @IBOutlet private var contentView: UIView!
    @IBOutlet private weak var iconContainerView: UIView!
    @IBOutlet private weak var iconImageView: UIImageView!
    @IBOutlet private weak var titleLabel: UILabel!

    var title: String? {
        get {
            return self.titleLabel.text
        }
        set {
            self.titleLabel.text = newValue
        }
    }

    var image: UIImage? {
        get {
            return self.iconImageView.image
        }
        set {
            self.iconImageView.image = newValue
        }
    }

    var imageBackgroundColor: UIColor? {
        get {
            return self.iconContainerView.backgroundColor
        }
        set {
            self.iconContainerView.backgroundColor = newValue
        }
    }

    override var isEnabled: Bool {
        get {
            return super.isEnabled
        }
        set {
            super.isEnabled = newValue
            self.iconContainerView.alpha = self.isEnabled ? 1 : 0.6
        }
    }

    override init(frame: CGRect) {
        super.init(frame: frame)
        self.initView()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        self.initView()
    }

    private func initView() {
        self.loadView("ControlButton")

        self.iconContainerView.clipsToBounds = true
        self.iconContainerView.layer.cornerRadius = self.iconContainerView.frame.size.width * 0.5
    }
}
