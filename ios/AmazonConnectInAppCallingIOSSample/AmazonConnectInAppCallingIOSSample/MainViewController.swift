//
//  MainViewController.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit

class MainViewController: UIViewController {
    
    private let config = Config()
    
    @IBOutlet weak var displayNameTextField: UITextField!
    
    @IBOutlet weak var cityTextField: UITextField!
    
    @IBOutlet weak var callKitSwitch: UISwitch!
    
    override func viewDidLoad() {
        super.viewDidLoad()
    }

    @IBAction func startCallButtonPressed(_ sender: Any) {
        self.view.endEditing(false)
        self.configCall()
        self.startCall()
    }
    
    private func configCall() {
        let displayName = self.displayNameTextField.text ?? ""
        let city = self.cityTextField.text ?? ""
        let attributes = [
            "DisplayName": displayName,
            "City": city
        ]
        let config = InAppCallingConfiguration(
            connectInstanceId: config.connectInstanceId,
            contactFlowId: config.contactFlowId,
            displayName: displayName,
            attributes: attributes,
            startWebrtcContactEndpoint: config.startWebrtcEndpoint,
            createParticipantConnectionEndpoint: config.createParticipantConnectionEndpoint,
            sendMessageEndpoint: config.sendMessageEndpoint,
            isCallKitEnabled: self.callKitSwitch.isOn)
        InAppCalling.configure(config)
    }
    
    private func startCall() {
        let callViewController = CallViewController()
        self.present(callViewController, animated: true)
    }
}
