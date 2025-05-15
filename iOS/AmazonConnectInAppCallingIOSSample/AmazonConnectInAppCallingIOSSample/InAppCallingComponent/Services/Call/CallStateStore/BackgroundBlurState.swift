//
//  BackgroundBlurState.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation
import AmazonChimeSDK

enum BackgroundBlurState: Int, CaseIterable {
    case high
    case medium
    case low
    case off

    var displayText: String {
        switch self {
        case .high: return "High"
        case .medium: return "Medium"
        case .low: return "Low"
        case .off: return "Off"
        }
    }

    var rawValue: Int {
        switch self {
        case .high:
            return BackgroundBlurStrength.high.rawValue
        case .medium:
            return BackgroundBlurStrength.medium.rawValue
        case .low:
            return BackgroundBlurStrength.low.rawValue
        case .off:
            return 0
        }
    }
}
