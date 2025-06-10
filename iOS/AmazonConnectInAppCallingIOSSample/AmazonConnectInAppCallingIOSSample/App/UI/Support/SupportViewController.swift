//
//  SupportViewController.swift

import UIKit
import SwiftUI

let StartInAppCallingNtfName = NSNotification.Name("startInAppCalling")
let DismissSupportViewControllerNtfName = NSNotification.Name("DismissSupportViewControllerNtfName")

class SupportViewController: UIViewController {

    static var isRunning = false

    private weak var chatController: UIHostingController<ContentView>?
    private weak var callController: CallViewController?

    public override var inputAccessoryView: UIView? {
        return callController?.inputAccessoryView
    }

    public override var canBecomeFirstResponder: Bool {
        return callController?.canBecomeFirstResponder ?? false
    }

    private let username: String
    private let context: [String: String]

    init(username: String, context: [String: String]) {
        self.username = username
        self.context = context
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        SupportViewController.isRunning = true
        self.setupController()
        // self.setupChatUI()
        self.startInAppCalling()
    }

    private func setupChatUI() {

        let chatView = ContentView()
        let hostingController = UIHostingController(rootView: chatView)
        self.addChild(hostingController)
        hostingController.view.translatesAutoresizingMaskIntoConstraints = false
        self.view.addSubview(hostingController.view)

        NSLayoutConstraint.activate([
            hostingController.view.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            hostingController.view.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            hostingController.view.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            hostingController.view.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
        hostingController.didMove(toParent: self)
        self.chatController = hostingController

        NotificationCenter.default.addObserver(self,
                                               selector: #selector(startInAppCalling),
                                               name: StartInAppCallingNtfName,
                                               object: nil)

        NotificationCenter.default.addObserver(self,
                                               selector: #selector(dismissController),
                                               name: DismissSupportViewControllerNtfName,
                                               object: nil)
    }

    private func setupController() {

        self.title = "Chat with us"

        let closeButton = UIBarButtonItem(barButtonSystemItem: .close,
                                          target: self,
                                          action: #selector(dismissController))
        self.navigationItem.leftBarButtonItem = closeButton
    }

    @objc private func dismissController() {
        self.dismiss(animated: true)
    }

    @objc private func startInAppCalling() {
        self.chatController?.removeFromParent()

        self.view.subviews.forEach { subview in
            subview.removeFromSuperview()
        }
        let config = Config()
        let inAppCallingConfig = InAppCallingConfiguration(connectInstanceId: config.connectInstanceId,
                                                           contactFlowId: config.contactFlowId,
                                                           displayName: self.username,
                                                           attributes: self.context,
                                                           startWebrtcContactEndpoint: config.startWebrtcEndpoint,
                                                           createParticipantConnectionEndpoint: config.createParticipantConnectionEndpoint,
                                                           sendMessageEndpoint: config.sendMessageEndpoint)
        InAppCalling.configure(inAppCallingConfig)

        let callController = CallViewController()
        self.callController = callController
        callController.willMove(toParent: self)

        self.addChild(callController)

        let callView = callController.view.subviews[0]
        self.view.addSubview(callView)

        NSLayoutConstraint.activate([
            callView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            callView.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor),
            callView.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor),
            callView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor)
        ])
        callController.didMove(toParent: self)
        callController.startCall()
    }
}
