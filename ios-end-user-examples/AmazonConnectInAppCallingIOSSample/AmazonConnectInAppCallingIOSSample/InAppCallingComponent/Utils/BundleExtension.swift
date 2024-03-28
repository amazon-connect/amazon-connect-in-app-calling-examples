//
//  BundleExtension.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation
import UIKit

// Helper methods
extension Bundle {
    
    struct Images {
        
        static var muted: UIImage? {
            return getImage("muted")
        }
        
        static var unmuted: UIImage? {
            return getImage("unmuted")
        }
        
        static var keypad: UIImage? {
            return getImage("keypad")
        }
        
        static var handset: UIImage? {
            return getImage("handset")
        }
        
        static var speaker: UIImage? {
            return getImage("speaker")
        }
        
        static var headphones: UIImage? {
            return getImage("headphones")
        }
        
        static var bluetooth: UIImage? {
            return getImage("bluetooth")
        }
        
        static var cameraOn: UIImage? {
            return getImage("camera-on")
        }
        
        static var cameraOff: UIImage? {
            return getImage("camera-off")
        }
        
        static var startCall: UIImage? {
            return getImage("start-call")
        }
        
        static var endCall: UIImage? {
            return getImage("end-call")
        }
        
        static var minimize: UIImage? {
            return getImage("minimize")
        }
        
        static var close: UIImage? {
            return getImage("close")
        }
        
        static var preferences: UIImage? {
            return getImage("preferences")
        }
        
        private static func getImage(_ name: String) -> UIImage? {
            return UIImage(named: name)
        }
    }
}
