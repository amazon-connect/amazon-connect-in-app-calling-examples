//
//  NSErrorExtension.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

extension NSError {
    
    convenience init(code: Int, localizedDescription: String? = nil) {
        let userInfo: [String: Any]? = localizedDescription != nil ? [
            NSLocalizedDescriptionKey: localizedDescription!
        ] : nil
        self.init(domain: Bundle.main.bundleIdentifier!,
                  code: code,
                  userInfo: userInfo)
    }
}
