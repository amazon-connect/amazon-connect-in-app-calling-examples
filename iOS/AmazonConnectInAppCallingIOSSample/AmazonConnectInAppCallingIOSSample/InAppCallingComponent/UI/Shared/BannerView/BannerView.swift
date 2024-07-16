//
//  BannerView.swift
//  AmazonConnectInAppCallingIOSSample
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit

class BannerView: UIStackView {

    override init(frame: CGRect) {
        super.init(frame: frame)
        initView()
    }
    
    required init(coder: NSCoder) {
        super.init(coder: coder)
        initView()
    }
    
    private func initView() {
        
        self.backgroundColor = UIColor(red: 204/255.0,
                                       green: 229/255.0,
                                       blue: 255/255.0,
                                       alpha: 1)
        self.layoutMargins = UIEdgeInsets(top: 12, left: 24, bottom: 12, right: 24)
        self.isLayoutMarginsRelativeArrangement = true
        self.layer.cornerRadius = 8
        self.layer.borderWidth = 2
        self.layer.borderColor = UIColor(red: 0,
                                         green: 64/255.0,
                                         blue: 133/255.0,
                                         alpha: 1).cgColor
    }

}
