//
//  BgBlurPicker.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit
import AmazonChimeSDK

class BgBlurPicker: UIViewController {

    @IBOutlet private weak var tableView: UITableView!

    private let vm: BgBlurPickerViewModel

    // The cell indexpath for current BGBlurState
    private var selectedCellPath: IndexPath?

    // Track all cells in tableview
    private var cells = [IndexPath: UITableViewCell]()

    private let cellId = "BGBlurStateCell"

    public init() {
        let serviceProvider = InAppCalling.serviceProvider!
        self.vm = BgBlurPickerViewModel(callManager: serviceProvider.callManager,
                                        callStateStore: serviceProvider.callStateStore)
        super.init(nibName: "BgBlurPicker", bundle: Bundle.main)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) is not allowed")
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        self.setupUI()
    }

    private func setupUI() {
        self.title = String.bgBlurDisplayText
        if #available(iOS 13.0, *) {
            self.overrideUserInterfaceStyle = .light
        }
        self.tableView.register(UITableViewCell.self, forCellReuseIdentifier: cellId)
        self.tableView.dataSource = self
        self.tableView.delegate = self
        self.tableView.reloadData()
        self.navigationItem.rightBarButtonItem = UIBarButtonItem(image: Bundle.Images.minimize,
                                                                 style: .plain,
                                                                 target: self,
                                                                 action: #selector(dismissController))
    }

    @objc private func dismissController() {
        self.dismiss(animated: true)
    }
}

// MARK: - UITableViewDataSource
extension BgBlurPicker: UITableViewDataSource {

    func numberOfSections(in tableView: UITableView) -> Int {
        return 1
    }

    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return BackgroundBlurState.allCases.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: cellId, for: indexPath)
        let state = BackgroundBlurState.allCases[indexPath.row]
        cell.textLabel?.text = state.displayText
        if self.vm.bgBlurStrength == state {
            self.selectedCellPath = indexPath
            cell.accessoryType = .checkmark
        } else {
            cell.accessoryType = .none
        }
        self.cells[indexPath] = cell
        return cell
    }
}

// MARK: - UITableViewDelegate
extension BgBlurPicker: UITableViewDelegate {

    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)

        let state = BackgroundBlurState.allCases[indexPath.row]
        self.vm.bgBlurStrength = state

        if let selectedCellPath = self.selectedCellPath {
            self.cells[selectedCellPath]?.accessoryType = .none
        }

        self.cells[indexPath]?.accessoryType = .checkmark
        self.selectedCellPath = indexPath
    }
}
