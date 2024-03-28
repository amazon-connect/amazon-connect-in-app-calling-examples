//
//  TitleView.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit

protocol TitleViewDelegate: AnyObject {
    
    func actionButtonTapped(_ sender: Any)
}

@IBDesignable
class TitleView: UIView {

    @IBOutlet private var contentView: UIView!
    @IBOutlet private weak var titleLabel: UILabel!
    @IBOutlet private weak var actionContainerView: UIControl!
    @IBOutlet private weak var actionImageView: UIImageView!
    
    weak var delegate: TitleViewDelegate?
    
    var title: String? {
        get {
            return self.titleLabel.text
        }
        set {
            self.titleLabel.text = newValue
        }
    }
    
    var actionButtonImage: UIImage? {
        get {
            return self.actionImageView.image
        }
        set {
            self.actionImageView.image = newValue
        }
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        initView()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        initView()
    }
    
    private func initView() {
        self.loadView("TitleView")
        
        self.actionContainerView.clipsToBounds = true
        self.actionContainerView.layer.cornerRadius = self.actionContainerView.frame.size.width * 0.5
    }
    
    @IBAction func actionButtonTapped(_ sender: Any) {
        self.delegate?.actionButtonTapped(sender)
    }
    
    func setMinimizeButtonHidden(isHidden: Bool) {
        self.actionContainerView.isHidden = isHidden
    }
}
