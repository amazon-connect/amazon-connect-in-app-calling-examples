//
//  ActionPanelCell.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit

class ActionPanelCell: UICollectionViewCell {

    // The action to perform when the button is pressed
    var action: (() -> Void)?

    @IBOutlet weak var actionButton: ControlButton!

    var title: String? {
        get {
            return self.actionButton.title
        }
        set {
            self.actionButton.title = newValue
        }
    }

    var image: UIImage? {
        get {
            return self.actionButton.image
        }
        set {
            self.actionButton.image = newValue
        }
    }

    var imageBackgroundColor: UIColor? {
        get {
            return self.actionButton.imageBackgroundColor
        }
        set {
            self.actionButton.imageBackgroundColor = newValue
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
        self.loadView("ActionPanelCell")
    }

    @IBAction func buttonTapped(_ sender: Any) {
        self.action?()
    }
}
