//
//  UIViewExtension.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation
import UIKit

extension UIView {
    
    // Find the UIViewController holding the view
    var viewController: UIViewController? {
        if let nextResponder = self.next as? UIViewController {
            return nextResponder
        } else if let nextResponder = self.next as? UIView {
            return nextResponder.viewController
        }
        return nil
    }
    
    // Load the view from nib file, add to parent view, and cover the whole parent view
    func loadView(_ nibName: String) {
        let views = Bundle.main.loadNibNamed(nibName, owner: self, options: nil)

        if let contentView = views?.first as? UIView {

            addSubview(contentView)

            contentView.translatesAutoresizingMaskIntoConstraints = false

            contentView.leftAnchor.constraint(equalTo: self.leftAnchor, constant: 0).isActive = true
            contentView.rightAnchor.constraint(equalTo: self.rightAnchor, constant: 0).isActive = true
            contentView.topAnchor.constraint(equalTo: self.topAnchor, constant: 0).isActive = true
            contentView.bottomAnchor.constraint(equalTo: self.bottomAnchor, constant: 0).isActive = true
        }
    }
}
