//
//  DTMFView.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit

protocol DTMFViewDelegate: UIViewController, AnyObject {
    
    func sendDidTap(_ sender: Any, _ data: String)
}

@IBDesignable
class DTMFView: UIView {
    
    @IBOutlet private var contentView: UIView!
    @IBOutlet private weak var titleView: TitleView!
    @IBOutlet private weak var inputTextField: UITextField!
    @IBOutlet private weak var sendButton: UIButton!
    @IBOutlet private weak var codeLabel: UILabel!
    @IBOutlet private weak var messageView: UIView!
    @IBOutlet private weak var messageText: UILabel!

    private weak var delegate: DTMFViewDelegate?
    private var firstResponder: Bool = false
    // Indicate if the view is in sending state
    private var isSending: Bool = false
    
    private let buttonSpinner: UIActivityIndicatorView = {
        let buttonSpinner = UIActivityIndicatorView(style: .gray)
        buttonSpinner.translatesAutoresizingMaskIntoConstraints = false
        buttonSpinner.hidesWhenStopped = true
        return buttonSpinner
    }()
    
    override init(frame: CGRect) {
        fatalError("init(frame:) is not allowed")
   }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) is not allowed")
    }
    
    required init(controller: DTMFViewDelegate) {
        super.init(frame: CGRect(x: 0, y: 0, width: 0, height: 146))
        self.loadView("DTMFView")
        self.delegate = controller
        self.setupUI()
    }
    
    private func setupUI() {
        // content view
        self.contentView.clipsToBounds = true
        self.contentView.layer.cornerRadius = 24
        self.contentView.layer.maskedCorners = [.layerMaxXMinYCorner, .layerMinXMinYCorner]
        
        // title view
        self.titleView.delegate = self
        self.titleView.title = String.dtmfViewTitle
        self.titleView.actionButtonImage = Bundle.Images.close
        self.titleView.backgroundColor = UIColor.headerViewBGColor
        
        // code label
        self.codeLabel.text = String.code
        
        // input fileld
        self.inputTextField.delegate = self
        self.inputTextField.borderStyle = .none
        self.inputTextField.font = UIFont.systemFont(ofSize: 17)
        self.inputTextField.keyboardType = .phonePad
        self.inputTextField.textAlignment = .center
        
        // send button
        self.sendButton.titleLabel?.font = UIFont.systemFont(ofSize: 17)
        self.sendButton.setTitle(String.send, for: .normal)
        self.sendButton.setTitleColor(UIColor.defaultActionColor, for: .normal)
        
        // button spinner
        sendButton.addSubview(buttonSpinner)
        buttonSpinner.centerXAnchor.constraint(equalTo: sendButton.centerXAnchor).isActive = true
        buttonSpinner.centerYAnchor.constraint(equalTo: sendButton.centerYAnchor).isActive = true
        
        // message view
        self.messageView.isHidden = true
        self.messageView.layer.cornerRadius = 4.0
        self.messageText.font = UIFont.systemFont(ofSize: 14)
    }
    
    func showMessage(_ message: String, _ success: Bool) {
        if success {
            self.messageText.textColor = .successViewTextColor
            self.messageView.backgroundColor = .successViewBGColor
        } else {
            self.messageText.textColor = .errorViewTextColor
            self.messageView.backgroundColor = .errorViewBGColor
        }
        self.messageView.isHidden = false
        self.messageText.text = message
    }
    
    func hideMessage() {
        self.messageView.isHidden = true
    }
    
    func clearInputTextField() {
        self.inputTextField.text = nil
    }
    
    func showSpinner() {
        self.isSending = true
        self.sendButton.isEnabled = false
        self.sendButton.setTitle(String.empty, for: .normal )
        buttonSpinner.startAnimating()
    }
    
    func hideSpinner() {
        self.isSending = false
        self.sendButton.isEnabled = true
        buttonSpinner.stopAnimating()
        self.sendButton.setTitle(String.send, for: .normal)
    }
    
    override var canBecomeFirstResponder: Bool {
        return firstResponder
    }
    
    // IBActions
    @IBAction func send(_ sender: UIButton) {
        self.delegate?.sendDidTap(sender, self.inputTextField.text!)
    }
    
    func showKeyboard() {
        self.firstResponder = true
        self.delegate?.becomeFirstResponder()
        self.inputTextField.becomeFirstResponder()
    }
    
    @objc func dismissKeyboard() {
        clearInputTextField()
        hideMessage()
        self.firstResponder = false
        self.inputTextField.resignFirstResponder()
    }
}

// UITextFieldDelegate
extension DTMFView: UITextFieldDelegate {
    // When the dtmf view is in sending state, the text input should not be editable.
    func textField(_ textField: UITextField,
                   shouldChangeCharactersIn range: NSRange,
                   replacementString string: String) -> Bool {
        if textField != self.inputTextField {
            return true
        }
        return !self.isSending
    }
}

// TitleViewDelegate
extension DTMFView: TitleViewDelegate {
    func actionButtonTapped(_ sender: Any) {
        self.dismissKeyboard()
    }
}
