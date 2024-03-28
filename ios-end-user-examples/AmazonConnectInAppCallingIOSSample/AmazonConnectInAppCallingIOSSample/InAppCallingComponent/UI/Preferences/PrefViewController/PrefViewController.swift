//
//  PrefViewController.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit

private enum TableSectionType {
    case speechEnhancement, videoEnhancement
}

class PrefViewController: UIViewController {

    @IBOutlet private weak var tableView: UITableView!
    
    private let tableSections: [TableSectionType] = [.speechEnhancement, .videoEnhancement]
    
    private let vm: PrefViewModel
    
    private weak var vfPrefCell: VoiceFocusPrefCell?
    private weak var bgBlurPrefCell: BgBlurPrefCell?
    
    private let callNtfCenter: CallNotificationCenter
    
    public init() {
        let serviceProvider = InAppCalling.serviceProvider!
        callNtfCenter = serviceProvider.callNtfCenter
        let callStateStore = serviceProvider.callStateStore
        let callManager = serviceProvider.callManager
        self.vm = PrefViewModel(callManager: callManager, callStateStore: callStateStore)
        super.init(nibName: "PrefViewController", bundle: Bundle.main)
        self.initController()
    }
    
    private func initController() {
        self.callNtfCenter.addObserver(self)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) is not allowed")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.setupUI()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        self.updateUI()
    }
    
    // SetupUI is called only once on controller is loaded for initialize UI components
    private func setupUI() {
        self.title = String.preferences
        if #available(iOS 13.0, *) {
            self.overrideUserInterfaceStyle = .light
        }
        self.tableView.register(VoiceFocusPrefCell.nib,
                                forCellReuseIdentifier: VoiceFocusPrefCell.cellId)
        self.tableView.register(BgBlurPrefCell.nib,
                                forCellReuseIdentifier: BgBlurPrefCell.cellId)
        self.tableView.rowHeight = UITableView.automaticDimension
        self.tableView.estimatedRowHeight = 44
        self.tableView.delegate = self
        self.tableView.dataSource = self
        self.navigationItem.rightBarButtonItem = UIBarButtonItem(image: Bundle.Images.minimize,
                                                                 style: .plain,
                                                                 target: self,
                                                                 action: #selector(dismissController))
    }
    
    // UpdateUI is the central method for updating UI whenever needed
    private func updateUI() {
        self.vfPrefCell?.isSwitchOn = self.vm.isVfEnabled
        self.bgBlurPrefCell?.bgBlurStrength = self.vm.bgBlurStrength
    }

    private func showBgBlurPicker() {
        let picker = BgBlurPicker()
        self.navigationController?.pushViewController(picker, animated: true)
    }
    
    @objc private func dismissController() {
        self.dismiss(animated: true)
    }
}

// MARK: - UITableViewDataSource
extension PrefViewController: UITableViewDataSource {
    
    func numberOfSections(in tableView: UITableView) -> Int {
        return self.tableSections.count
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return 1
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let sectionType = self.tableSections[indexPath.section]
        switch sectionType {
        case .speechEnhancement:
            return self.configureVfTableCell(tableView, cellForRowAt: indexPath)
        case .videoEnhancement:
            return self.configureBgBlurTableCell(tableView, cellForRowAt: indexPath)
        }
    }
    
    private func configureVfTableCell(_ tableView: UITableView,
                                      cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cellId = VoiceFocusPrefCell.cellId
        if let cell = tableView.dequeueReusableCell(withIdentifier: cellId,
                                                    for: indexPath) as? VoiceFocusPrefCell {
            cell.selectionStyle = .none
            cell.isSwitchOn = self.vm.isVfEnabled
            cell.delegate = self
            self.vfPrefCell = cell
            return cell
        }
        
        return UITableViewCell()
    }
    
    private func configureBgBlurTableCell(_ tableView: UITableView,
                                          cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cellId = BgBlurPrefCell.cellId
        if let cell = tableView.dequeueReusableCell(withIdentifier: cellId,
                                                    for: indexPath) as? BgBlurPrefCell {
            cell.bgBlurStrength = self.vm.bgBlurStrength
            cell.accessoryType = .disclosureIndicator
            self.bgBlurPrefCell = cell
            return cell
        }
        return UITableViewCell()
    }
    
    func tableView(_ tableView: UITableView, titleForHeaderInSection section: Int) -> String? {
        let sectionType = self.tableSections[section]
        switch sectionType {
        case .speechEnhancement:
            return String.speechEnhancementDisplayText
        case .videoEnhancement:
            return String.videoEnhancementDisplayText
        }
    }
}

// MARK: - UITableViewDataSource
extension PrefViewController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        
        let sectionType = self.tableSections[indexPath.section]
        if sectionType == .videoEnhancement {
            self.showBgBlurPicker()
        }
    }
}

// MARK: - VoiceFocusPrefCellDelegate
extension PrefViewController: VoiceFocusPrefCellDelegate {
    
    func switchValueChanged(_ sender: VoiceFocusPrefCell) {
        self.vm.isVfEnabled = sender.isSwitchOn
        self.updateUI()
    }
}

extension PrefViewController: CallObserver {
    func callStateDidUpdate(_ oldState: CallState, _ newState: CallState) {}
    
    func callErrorDidOccur(_ error: Error) {
        DispatchQueue.main.async {
            self.showError(error)
        }
    }
    
    func muteStateDidUpdate() {}
    
    func videoTileStateDidAdd() {}
    
    func videoTileStateDidRemove() {}
}
