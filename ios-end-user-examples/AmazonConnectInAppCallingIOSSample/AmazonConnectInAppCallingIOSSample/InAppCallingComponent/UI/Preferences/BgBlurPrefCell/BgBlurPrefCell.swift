//
//  BgBlurPrefCell.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit

class BgBlurPrefCell: UITableViewCell {

    @IBOutlet private weak var bgBlurStrengthLabel: UILabel!
    
    static var nib: UINib {
        return UINib(nibName: "BgBlurPrefCell", bundle: .main)
    }
    
    static var cellId: String {
        return "BgBlurPrefCell"
    }
    
    var bgBlurStrength: BackgroundBlurState? {
        didSet {
            switch self.bgBlurStrength {
            case .high, .medium, .low:
                self.bgBlurStrengthLabel.text = "On - \(self.bgBlurStrength!.displayText.lowercased())"
            case .off, nil:
                self.bgBlurStrengthLabel.text = "Off"
            }
        }
    }
}
