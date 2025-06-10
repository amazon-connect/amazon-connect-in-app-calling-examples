//
//  ActionPanelView.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit
import AVFAudio

private typealias ViewModel = ActionPanelViewModel

private enum ActionButtonType {

    case mute
    case keypad
    case audio // Device selection
    case video
    case preferences
    case screenShare
}

protocol ActionPanelViewDelegate: AnyObject {

    func keypadButtonDidTap(_ sender: Any)
    func preferencesButtonDidTap(_ sender: Any)
    func shareScreenButtonDidTap(_ sender: Any)
}

private class CommonInitData {
    let callNtfCenter: CallNotificationCenter
    let vm: ViewModel

    init(callNtfCenter: CallNotificationCenter,
         vm: ViewModel) {
        self.callNtfCenter = callNtfCenter
        self.vm = vm
    }
}

class ActionPanelView: UIView {

    @IBOutlet private weak var collectionView: UICollectionView!

    weak var delegate: ActionPanelViewDelegate?

    private let actionCellID = "actionCell"
    private let audioActionCellID = "audioActionCell"

    // The action button container view width
    private let cellHeight: CGFloat = 64

    private let vm: ViewModel
    private let callNtfCenter: CallNotificationCenter

    // Determine the num of buttons per row
    private var buttonsPerRow: Int {
        let numButtons = self.actionButtons.count
        return numButtons <= 4 ? numButtons : 3
    }

    // Determine the available actions buttons
    private var actionButtons: [ActionButtonType] {
        if self.vm.isScreenShareCapabilityEnabled {
            return [.mute, .keypad, .audio, .video, .preferences, .screenShare]
        } else {
            return [.mute, .keypad, .audio, .video, .preferences]
        }
    }

    // This varaible will determine the action panel height in call view
    override var intrinsicContentSize: CGSize {
        // Calculate the height of layout inset top/bottom
        let collectionViewLayout = self.collectionView.collectionViewLayout as? UICollectionViewFlowLayout
        let lineSpacing = collectionViewLayout?.minimumLineSpacing ?? 0
        let sectionInsetTop = collectionViewLayout?.sectionInset.top ?? 0
        let sectionInsetBottom = collectionViewLayout?.sectionInset.bottom ?? 0
        let sectionInsetHeight = sectionInsetTop + sectionInsetBottom

        // Calculate the height of rows
        let numButtons = self.actionButtons.count
        let rows = numButtons / buttonsPerRow + min(numButtons % buttonsPerRow, 1)
        let rowsHeight = CGFloat(rows) * cellHeight + CGFloat(rows - 1) * lineSpacing

        let height = rowsHeight + sectionInsetHeight
        return CGSize(width: super.intrinsicContentSize.width, height: height)
    }

    override init(frame: CGRect) {
        let commonInitData = Self.commonInit()
        self.callNtfCenter = commonInitData.callNtfCenter
        self.vm = commonInitData.vm
        super.init(frame: frame)
        self.initView()
    }

    required init?(coder: NSCoder) {
        let commonInitData = Self.commonInit()
        self.callNtfCenter = commonInitData.callNtfCenter
        self.vm = commonInitData.vm
        super.init(coder: coder)
        self.initView()
    }

    private static func commonInit() -> CommonInitData {
        let serviceProvider = InAppCalling.serviceProvider!
        let vm = ViewModel(callManager: serviceProvider.callManager,
                           callStateStore: serviceProvider.callStateStore)
        return CommonInitData(callNtfCenter: serviceProvider.callNtfCenter, vm: vm)
    }

    private func registerAudioRouteChangeNotification() {
        NotificationCenter.default.addObserver(self,
                                               selector: #selector(updateUI),
                                               name: AVAudioSession.routeChangeNotification,
                                               object: nil)
    }

    private func initView() {
        self.loadView("ActionPanelView")
        self.setupUI()
        self.updateUI()
        self.callNtfCenter.addObserver(self)
    }

    private func setupUI() {
        self.collectionView.register(ActionPanelCell.self,
                                     forCellWithReuseIdentifier: actionCellID)
        self.collectionView.register(ActionPanelAudioCell.self,
                                     forCellWithReuseIdentifier: audioActionCellID)
        self.collectionView.delegate = self
        self.collectionView.dataSource = self

        self.registerAudioRouteChangeNotification()
    }

    @objc private func updateUI() {
        self.collectionView.reloadData()
        self.invalidateIntrinsicContentSize()
    }
}

extension ActionPanelView: UICollectionViewDataSource {

    func numberOfSections(in collectionView: UICollectionView) -> Int {
        return 1
    }

    func collectionView(_ collectionView: UICollectionView,
                        numberOfItemsInSection section: Int) -> Int {
        return self.actionButtons.count
    }

    func collectionView(_ collectionView: UICollectionView,
                        cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let buttons = self.actionButtons
        let button = buttons[indexPath.row]

        if button == .audio {
            guard let cell = self.collectionView.dequeueReusableCell(
                withReuseIdentifier: audioActionCellID,
                for: indexPath) as? ActionPanelAudioCell else {
                return UICollectionViewCell()
            }
            configureAudioCell(cell)
            return cell
        }

        guard let cell = self.collectionView.dequeueReusableCell(
            withReuseIdentifier: actionCellID,
            for: indexPath) as? ActionPanelCell else {
            return UICollectionViewCell()
        }
        switch button {
        case .mute: configureMuteCell(cell)
        case .keypad: configureKeypadCell(cell)
        case .audio: break
        case .video: configureVideoCell(cell)
        case .preferences: configurePrefCell(cell)
        case .screenShare: configureScreenshareCell(cell)
        }
        return cell
    }

    private func configureMuteCell(_ cell: ActionPanelCell) {
        cell.title = self.vm.isLocalMuted
                ? String.unmute : String.mute
        cell.image = self.vm.isLocalMuted
                ? Bundle.Images.muted : Bundle.Images.unmuted
        cell.imageBackgroundColor = self.vm.isLocalMuted
                ? UIColor.actionButtonOffBGColor : UIColor.defaultActionColor
        cell.action = { [weak self] in
            guard let self = self else { return }
            self.vm.isLocalMuted = !self.vm.isLocalMuted
        }
    }

    private func configureKeypadCell(_ cell: ActionPanelCell) {
        cell.title = String.keypad
        cell.image = Bundle.Images.keypad
        cell.imageBackgroundColor = UIColor.actionButtonOffBGColor
        cell.action = { [weak self] in
            guard let self = self else { return }
            self.delegate?.keypadButtonDidTap(self)
        }
    }

    // Device selection
    private func configureAudioCell(_ cell: ActionPanelCell) {
        // Placeholder to reset action when when dequeue/reuse cell
        cell.action = { }
        let audioSession = AVAudioSession.sharedInstance()
        guard let currentOutput = audioSession.currentRoute.outputs.first else {
            cell.title = String.NA
            cell.image = Bundle.Images.handset
            cell.imageBackgroundColor = UIColor.actionButtonOffBGColor
            return
        }
        switch currentOutput.portType {
        case .builtInReceiver:
            cell.title = String.handset
            cell.image = Bundle.Images.handset
            cell.imageBackgroundColor = UIColor.actionButtonOffBGColor
        case .bluetoothLE, .bluetoothHFP, .bluetoothA2DP:
            cell.title = String.bluetooth
            cell.image = Bundle.Images.bluetooth
            cell.imageBackgroundColor = UIColor.defaultActionColor
        case .headphones:
            cell.title = String.headphones
            cell.image = Bundle.Images.headphones
            cell.imageBackgroundColor = UIColor.defaultActionColor
        default:
            cell.title = String.speaker
            cell.image = Bundle.Images.speaker
            cell.imageBackgroundColor = UIColor.defaultActionColor
        }
    }

    private func configureVideoCell(_ cell: ActionPanelCell) {
        cell.title = self.vm.isLocalVideoOn
                ? String.stopVideo : String.startVideo
        cell.image = self.vm.isLocalVideoOn
                ? Bundle.Images.cameraOn : Bundle.Images.cameraOff
        cell.imageBackgroundColor = self.vm.isLocalVideoOn
                ? UIColor.defaultActionColor : UIColor.actionButtonOffBGColor
        cell.action = { [weak self] in
            guard let self = self else { return }
            self.vm.isLocalVideoOn = !self.vm.isLocalVideoOn
        }
    }

    private func configurePrefCell(_ cell: ActionPanelCell) {
        cell.title = .preferences
        cell.image = Bundle.Images.preferences
        cell.imageBackgroundColor = UIColor.actionButtonOffBGColor
        cell.action = { [weak self] in
            guard let self = self else { return }
            self.delegate?.preferencesButtonDidTap(self)
        }
    }

    private func configureScreenshareCell(_ cell: ActionPanelCell) {
        cell.title = self.vm.screenShareStatus == .local ? .stopShare : .shareScreen
        cell.image = self.vm.screenShareStatus == .local
                ? Bundle.Images.screenShareWhite : Bundle.Images.screenShare
        cell.imageBackgroundColor = self.vm.screenShareStatus == .local
                ? UIColor.defaultActionColor : UIColor.actionButtonOffBGColor
        cell.action = { [weak self] in
            guard let self = self else { return }
            self.delegate?.shareScreenButtonDidTap(self)
        }
    }
}

extension ActionPanelView: UICollectionViewDelegateFlowLayout {

    func collectionView(_ collectionView: UICollectionView,
                        layout collectionViewLayout: UICollectionViewLayout,
                        sizeForItemAt indexPath: IndexPath) -> CGSize {
        let cellWidth = self.frame.size.width / CGFloat(buttonsPerRow)
        return CGSize(width: cellWidth, height: cellHeight)
    }
}

extension ActionPanelView: CallObserver {
    func screenShareCapabilityDidUpdate() {
        DispatchQueue.main.async { self.updateUI() }
    }

    func screenShareStatusDidUpdate() {
        DispatchQueue.main.async { self.updateUI() }
    }

    func callStateDidUpdate(_ oldState: CallState,
                            _ newState: CallState) {
        DispatchQueue.main.async { self.updateUI() }
    }

    func callErrorDidOccur(_ error: Error) {}

    func muteStateDidUpdate() {
        DispatchQueue.main.async { self.updateUI() }
    }

    func videoTileStateDidAdd() {
        DispatchQueue.main.async { self.updateUI() }
    }

    func videoTileStateDidRemove() {
        DispatchQueue.main.async { self.updateUI() }
    }

    func messageDidUpdate(_ message: String?) {}
}
