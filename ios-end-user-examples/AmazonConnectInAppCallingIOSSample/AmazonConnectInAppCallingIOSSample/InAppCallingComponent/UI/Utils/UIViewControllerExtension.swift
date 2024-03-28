//
//  UIViewControllerExtension.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit

extension UIViewController {
    
    func presentInNavController(_ viewController: UIViewController) {
        let navController = UINavigationController(rootViewController: viewController)
        if #available(iOS 13.0, *) {
            navController.overrideUserInterfaceStyle = .light
        }
        navController.navigationBar.tintColor = UIColor.defaultActionColor
        self.present(navController, animated: true)
    }
    
    func showError(_ error: Error) {
        let alert = UIAlertController(title: String.error,
                                      message: error.localizedDescription,
                                      preferredStyle: .alert)
        let defaultAction = UIAlertAction(title: .ok, style: .default)
        alert.addAction(defaultAction)
        self.present(alert, animated: true)
    }
}
