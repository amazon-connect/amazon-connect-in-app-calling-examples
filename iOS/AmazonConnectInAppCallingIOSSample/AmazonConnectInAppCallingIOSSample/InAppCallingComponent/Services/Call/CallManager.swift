//
//  DefaultCallManager.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation
import AmazonChimeSDK
import AVFAudio

private enum ScreenShareDataMessageType: String {
    case screenSharingStarted = "ScreenSharingStarted"
    case screenSharingStopped = "ScreenSharingStopped"
}

class CallManager {
    
    private let screenShareCapabilityMessage = "Screen-sharing session has started, you can now share your screen."
    
    // The data message topic for screen share
    private let screenShareSessionTopic = "AMAZON_CONNECT_SCREEN_SHARING"
    
    private let apiClient: ApiClient
    private let sdkLogger: Logger
    private let deviceHelper: DeviceHelper
    
    private let callStateStore: CallStateStore
    
    private var callSession: MeetingSession?
    
    private let config: InAppCallingConfiguration
    
    private var cameraCaptureSource: CameraCaptureSource
    private var bgBlurVideoFrameProcessor: BackgroundBlurVideoFrameProcessor
    
    private var screenShare: ScreenShare?
    
    init(_ config: InAppCallingConfiguration,
         _ apiClient: ApiClient,
         callStateStore: CallStateStore,
         _ deviceHelper: DeviceHelper) {
        self.config = config
        self.apiClient = apiClient
        self.callStateStore = callStateStore
        self.deviceHelper = deviceHelper
        self.sdkLogger = ConsoleLogger(name: "InAppCallingSample")
        self.cameraCaptureSource = DefaultCameraCaptureSource(logger: sdkLogger)
        self.bgBlurVideoFrameProcessor = BackgroundBlurVideoFrameProcessor(
            backgroundBlurConfiguration: BackgroundBlurConfiguration(logger: sdkLogger))
    }
}

// Call manipulation
extension CallManager {
    
    func startCall(isCallKitEnabled: Bool) {
        if self.callStateStore.callState != .notStarted { return }
        
        self.deviceHelper.requestAudioPermissionIfNeeded { [weak self] error in
            if let error = error {
                self?.callStateStore.callError = error
                return
            }

            self?.callStateStore.callState = .calling
            
            guard let createSessionResponse = self?.createWebrtcContact() else {
                self?.callStateStore.callError = Errors.createMeetingSessionFailed
                self?.callStateStore.callState = .notStarted
                return
            }
            
            guard self?.startMeetingSession(createSessionResponse,
                                            isCallKitEnabled: isCallKitEnabled) == true else {
                self?.callStateStore.callError = Errors.startMeetingSessionFailed
                self?.callStateStore.callState = .notStarted
                return
            }
        }
    }
    
    // Call can be ended only in 'Incall' or `Reconnecting` state
    func endCall() {
        if self.callStateStore.callState != .inCall &&  self.callStateStore.callState != .reconnecting {
            return
        }
        self.screenShare?.stopScreenShare()
        self.callSession?.audioVideo.stop()
    }
    
    private func createWebrtcContact() -> CreateWebrtcContactResponse? {
        
        var resultResponse: CreateWebrtcContactResponse?
        
        let group = DispatchGroup()
        group.enter()
        
        self.apiClient.createWebrtcContact(connectInstanceId: self.config.connectInstanceId,
                                           contactFlowId: self.config.contactFlowId,
                                           displayName: self.config.displayName,
                                           attributes: self.config.attributes) { response in
            let localAttendeeId = response.connectionData.attendee.attendeeId
            let participantToken = response.participantToken
            
            self.callStateStore.localAttendeeId = localAttendeeId
            self.callStateStore.setMuteState(attendeeId: localAttendeeId, isMuted: false)
            self.callStateStore.participantToken = participantToken
            
            resultResponse = response
            group.leave()
        } onFailure: { error in
            group.leave()
        }
        
        group.wait()
        
        return resultResponse
    }
    
    private func startMeetingSession(
        _ createWebrtcContactResponse: CreateWebrtcContactResponse,
        isCallKitEnabled: Bool) -> Bool {
        guard let meetingSessionConfig = MeetingSessionConfiguration(createWebrtcContactResponse) else {
            return false
        }
        let callSession = DefaultMeetingSession(configuration: meetingSessionConfig, logger: self.sdkLogger)
        
        callSession.audioVideo.addAudioVideoObserver(observer: self)
        callSession.audioVideo.addRealtimeObserver(observer: self)
        callSession.audioVideo.addVideoTileObserver(observer: self)
        callSession.audioVideo.addRealtimeDataMessageObserver(topic: self.screenShareSessionTopic,
                                                              observer: self)
        self.callSession = callSession
        
        do {
            try self.configureAudioSession()
            try self.callSession?.audioVideo.start(callKitEnabled: isCallKitEnabled)
            return true
        } catch {
            return false
        }
    }
}

extension CallManager: ScreenShareDelegate {
    
    func startScreenShare() {
        guard let audioVideo = self.callSession?.audioVideo else {
            return
        }
        let screenShare = InAppScreenShare(contentShareController: audioVideo)
        self.screenShare = screenShare
        screenShare.delegate = self
        screenShare.startScreenShare()
    }
    
    func stopScreenShare() {
        self.screenShare?.stopScreenShare()
        screenShareDidStop()
    }
    
    func screenShareDidStart() {
        self.callStateStore.screenShareStatus = .local
    }
    
    func screenShareDidStop() {
        self.callStateStore.screenShareStatus = self.callStateStore.screenShareStatus == .remote ? .remote : .none
    }
    
    func screenShareDidFail() {
        self.stopScreenShare()
        self.callStateStore.screenShareStatus = self.callStateStore.screenShareStatus == .remote ? .remote : .none
    }
    
    func bindLocalScreenShareSink(videoSink: VideoSink) {
        self.screenShare?.addVideoSink(videoSink)
    }
    
    func unbindLocalScreenShareSink(videoSink: VideoSink) {
        self.screenShare?.removeVideoSink(videoSink)
    }
}

// MARK: - Audio handling
extension CallManager {
    
    func setMute(_ isMuted: Bool) {
        guard let attendeId = self.callStateStore.localAttendeeId else {
            return
        }
        if self.callStateStore.isLocalMuted == isMuted {
            return
        }
        
        if isMuted {
            _ = self.callSession?.audioVideo.realtimeLocalMute()
        } else {
            _ = self.callSession?.audioVideo.realtimeLocalUnmute()
        }
        self.callStateStore.setMuteState(attendeeId: attendeId, isMuted: isMuted)
    }
    
    func setVoiceFocusEnabled(_ enabled: Bool) {
        if self.callSession?.audioVideo.realtimeSetVoiceFocusEnabled(enabled: enabled) ?? false {
            self.callStateStore.isVoiceFocusEnabled = enabled
        }
    }
}

// Video handling
extension CallManager {
    
    func startLocalVideo() {
        self.deviceHelper.requestCameraPermissionIfNeeded { [weak self] error in
            if let error = error {
                self?.callStateStore.callError = error
                return
            }
            
            guard let weakSelf = self else {
                return
            }
            
            
            weakSelf.cameraCaptureSource.start()
            weakSelf.callSession?.audioVideo.startLocalVideo(source: weakSelf.cameraCaptureSource)
            
            if let bgBlurState = weakSelf.callStateStore.bgBlurState,
               bgBlurState != .off {
                weakSelf.turnOnBGBlur(bgBlurState)
            }
        }
    }
    
    func stopLocalVideo() {
        self.cameraCaptureSource.stop()
        self.callSession?.audioVideo.stopLocalVideo()
    }
    
    func switchCamera() {
        self.cameraCaptureSource.switchCamera()
    }
    
    func turnOnBGBlur(_ strength: BackgroundBlurState) {
        if strength == .off {
            self.turnOffBGBlur()
            return
        }
        
        self.cameraCaptureSource.addVideoSink(sink: self.bgBlurVideoFrameProcessor)
        self.callSession?.audioVideo.startLocalVideo(source: self.bgBlurVideoFrameProcessor)
        if let bgBlurStrength = BackgroundBlurStrength(rawValue: strength.rawValue) {
            self.bgBlurVideoFrameProcessor.setBlurStrength(newBlurStrength: bgBlurStrength)
        }
        
        self.callStateStore.bgBlurState = strength
    }
    
    func turnOffBGBlur() {
        self.cameraCaptureSource.removeVideoSink(sink: self.bgBlurVideoFrameProcessor)
        self.callSession?.audioVideo.startLocalVideo(source: self.cameraCaptureSource)
        
        self.callStateStore.bgBlurState = .off
    }
    
    func bindVideoView(_ videoView: DefaultVideoRenderView, _ tileState: VideoTileState) {
        self.callSession?.audioVideo.bindVideoView(videoView: videoView, tileId: tileState.tileId)
    }
    
    func unbindVideoView(_ tileState: VideoTileState) {
        self.callSession?.audioVideo.unbindVideoView(tileId: tileState.tileId)
    }
    
    private func configureAudioSession() throws {
        let audioSession = AVAudioSession.sharedInstance()
        if audioSession.category != .playAndRecord {
            try audioSession.setCategory(AVAudioSession.Category.playAndRecord,
                                         options: AVAudioSession.CategoryOptions.allowBluetooth)
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        }
        if audioSession.mode != .voiceChat {
            try audioSession.setMode(.voiceChat)
        }
    }
}


extension CallManager: AudioVideoObserver {
    func audioSessionDidStartConnecting(reconnecting: Bool) {}
    
    func audioSessionDidStart(reconnecting: Bool) {
        if !reconnecting && self.callStateStore.callState != .calling {
            self.endCall()
            return
        }
        
        if reconnecting && self.callStateStore.callState == .reconnecting {
            self.callStateStore.callState = .inCall
        }
    }
    
    func audioSessionDidDrop() {
        // The session could drop before agent joins the meeting session
        if self.callStateStore.callState == .calling {
            return
        }
        self.callStateStore.callState = .reconnecting
    }
    
    func audioSessionDidStopWithStatus(sessionStatus: AmazonChimeSDK.MeetingSessionStatus) {
        if sessionStatus.statusCode != .ok {
            self.callStateStore.callError = Errors.callSessionAborted
        }
        self.callStateStore.callState = .notStarted
    }
    
    func audioSessionDidCancelReconnect() {}
    
    func connectionDidRecover() {}
    
    func connectionDidBecomePoor() {}
    
    func videoSessionDidStartConnecting() {}
    
    func videoSessionDidStartWithStatus(sessionStatus: AmazonChimeSDK.MeetingSessionStatus) {
        self.setVoiceFocusEnabled(true)
        self.callSession?.audioVideo.startRemoteVideo()
    }
    
    func videoSessionDidStopWithStatus(sessionStatus: AmazonChimeSDK.MeetingSessionStatus) {}
    
    func remoteVideoSourcesDidBecomeAvailable(sources: [AmazonChimeSDK.RemoteVideoSource]) {}
    
    func remoteVideoSourcesDidBecomeUnavailable(sources: [AmazonChimeSDK.RemoteVideoSource]) {}
    
    func cameraSendAvailabilityDidChange(available: Bool) {}

}

extension CallManager: RealtimeObserver {
    func volumeDidChange(volumeUpdates: [AmazonChimeSDK.VolumeUpdate]) {}
    
    func signalStrengthDidChange(signalUpdates: [AmazonChimeSDK.SignalUpdate]) {}
    
    func attendeesDidJoin(attendeeInfo: [AmazonChimeSDK.AttendeeInfo]) {
        if attendeeInfo.filter({ attendeeInfo in
            attendeeInfo.externalUserId.hasSuffix("agent")
        }).count > 0 {
            self.callStateStore.callState = .inCall
        }
    }
    
    func attendeesDidLeave(attendeeInfo: [AmazonChimeSDK.AttendeeInfo]) {}
    
    func attendeesDidDrop(attendeeInfo: [AmazonChimeSDK.AttendeeInfo]) {}
    
    func attendeesDidMute(attendeeInfo: [AmazonChimeSDK.AttendeeInfo]) {
        for currentAttendeeInfo in attendeeInfo {
            self.callStateStore.setMuteState(attendeeId: currentAttendeeInfo.attendeeId, isMuted: true)
        }
    }
    
    func attendeesDidUnmute(attendeeInfo: [AmazonChimeSDK.AttendeeInfo]) {
        for currentAttendeeInfo in attendeeInfo {
            self.callStateStore.setMuteState(attendeeId: currentAttendeeInfo.attendeeId, isMuted: false)
        }
    }

}

extension CallManager: VideoTileObserver {
    func videoTileDidAdd(tileState: AmazonChimeSDK.VideoTileState) {
        if tileState.isContent {
            // Only remote content share will trigger onVideoTileAdded
            self.stopScreenShare()
            self.callStateStore.screenShareStatus = .remote
        }
        self.callStateStore.addVideoTile(tileState)
    }
    
    func videoTileDidRemove(tileState: AmazonChimeSDK.VideoTileState) {
        if tileState.isContent {
            self.callStateStore.screenShareStatus = self.callStateStore.screenShareStatus == .local ? .local : .none
        }
        self.callStateStore.removeVideoTile(tileState)
    }
    
    func videoTileDidPause(tileState: AmazonChimeSDK.VideoTileState) {}
    
    func videoTileDidResume(tileState: AmazonChimeSDK.VideoTileState) {}
    
    func videoTileSizeDidChange(tileState: AmazonChimeSDK.VideoTileState) {}
}

extension CallManager: DataMessageObserver {
    
    func dataMessageDidReceived(dataMessage: AmazonChimeSDK.DataMessage) {
        if dataMessage.topic == screenShareSessionTopic {
            let jsonDict = try? JSONSerialization.jsonObject(with: dataMessage.data, options: []) as? [String: String] ?? [:]
            guard let message = jsonDict?["message"] else {
                return
            }
            if message == ScreenShareDataMessageType.screenSharingStarted.rawValue {
                if !self.callStateStore.isScreenShareCapabilityEnabled {
                    self.callStateStore.isScreenShareCapabilityEnabled = true
                    self.callStateStore.message = screenShareCapabilityMessage
                }
            } else if message == ScreenShareDataMessageType.screenSharingStopped.rawValue {
                if self.callStateStore.isScreenShareCapabilityEnabled {
                    self.callStateStore.isScreenShareCapabilityEnabled = false
                    if self.callStateStore.message == screenShareCapabilityMessage {
                        self.callStateStore.message = nil
                    }
                    if self.callStateStore.screenShareStatus != .none {
                        self.stopScreenShare()
                    }
                }
            }
        }
    }
}
