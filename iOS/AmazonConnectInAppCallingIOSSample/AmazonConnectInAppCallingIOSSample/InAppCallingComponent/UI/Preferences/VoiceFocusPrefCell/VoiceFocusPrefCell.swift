//
//  VoiceFocusPrefCell.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit

protocol VoiceFocusPrefCellDelegate: AnyObject {
    func switchValueChanged(_ sender: VoiceFocusPrefCell)
}

class VoiceFocusPrefCell: UITableViewCell {

    weak var delegate: VoiceFocusPrefCellDelegate?

    @IBOutlet private weak var vfSwitch: UISwitch!

    var isSwitchOn: Bool {
        get {
            return self.vfSwitch.isOn
        }
        set {
            self.vfSwitch.isOn = newValue
        }
    }

    static var nib: UINib {
        return UINib(nibName: "VoiceFocusPrefCell",
                     bundle: Bundle.main)
    }

    static var cellId: String {
        return "VoiceFocusPrefCell"
    }

    override var reuseIdentifier: String? {
        return VoiceFocusPrefCell.cellId
    }

    @IBAction func switchValueChanged(_ sender: Any) {
        self.delegate?.switchValueChanged(self)
    }
}
