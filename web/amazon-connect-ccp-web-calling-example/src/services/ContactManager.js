//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import {
  DefaultMeetingSession,
  MeetingSessionConfiguration,
  ConsoleLogger,
  LogLevel,
  DefaultDeviceController,
  VideoFxProcessor,
  DefaultVideoTransformDevice,
} from 'amazon-chime-sdk-js';

import eventBus from '../utils/EventBus';

const CCP_URL = '<your-ccp-url>';

class ContactManager {
  logger;
  deviceController;
  meetingSession;

  currentContact;
  currentAgent;
  isAgentMuted;

  selectedCamera;

  videoFxProcessor;
  isVideoFxProcessorSupported;

  videoFxConfig = {
    backgroundBlur: {
      isEnabled: true,
      strength: 'medium',
    },
    backgroundReplacement: {
      isEnabled: false,
      backgroundImageURL: undefined,
      defaultColor: undefined,
    },
  };

  async init() {
    this.initCCP();
    this.subscribeToContactEvents();
    this.subscribeToAgentEvents();

    this.setupDeviceController();
    await this.initVideoFxProcessor();
    await this.selectCamera();
  }

  initCCP() {
    const containerDiv = document.querySelector('#connect-streams-ccp');

    connect.core.initCCP(containerDiv, {
      ccpUrl: CCP_URL,
      loginOptions: {
        autoClose: true,
        height: 550,
        width: 350,
      },
      softphone: {
        allowFramedSoftphone: true,
        allowFramedVideoCall: false,
      },
    });
  }

  async initVideoFxProcessor() {
    this.isVideoFxProcessorSupported = await VideoFxProcessor.isSupported(this.logger);

    if (this.isVideoFxProcessorSupported) {
      this.videoFxProcessor = await VideoFxProcessor.create(this.logger, this.videoFxConfig);
    }
  }

  subscribeToContactEvents() {
    connect.contact((contact) => {
      this.currentContact = contact;
      contact.onConnecting((contact) => this.handleContactConnecting(contact));
      contact.onConnected(async (contact) => await this.handleContactConnected(contact));
      contact.onACW((contact) => this.handleContactACW(contact));
      contact.onDestroy((contact) => this.handleContactDestroy(contact));
    });
  }

  subscribeToAgentEvents() {
    connect.agent((agent) => {
      this.currentAgent = agent;
      eventBus.emit('AgentInitialized');
      agent.onRefresh((agent) => this.handleAgentRefresh(agent));
      agent.onMuteToggle((isAgentMutedStatus) => {
        this.handleAgentMuteToggle(isAgentMutedStatus);
      });
    });
  }

  handleContactConnecting(contact) {
    contact.accept();
  }

  async handleContactConnected(contact) {
    if (this.isVideoContact(contact)) {
      await this.setupChimeMeetingSession(contact);
      this.meetingSession.audioVideo.start();
    }
    eventBus.emit('ContactConnected');
  }

  handleContactACW(contact) {
    eventBus.emit('ContactACW');
    // meetingSession is undefined for voice contact
    this.meetingSession?.audioVideo.stop();
    this.meetingSession?.audioVideo.stopLocalVideoTile();
  }

  handleContactDestroy(contact) {
    eventBus.emit('ContactDestroy');
    this.meetingSession = undefined;
  }

  handleAgentRefresh(agent) {
    const status = agent.getStatus().name;
    eventBus.emit('AgentRefresh', status);
  }

  handleAgentMuteToggle(isAgentMutedStatus) {
    const isAgentMuted = isAgentMutedStatus.muted;
    this.isAgentMuted = isAgentMuted;
    eventBus.emit('AgentMuteToggle', isAgentMuted);
  }

  getConnectionState() {
    return this.currentContact.getAgentConnection().getState();
  }

  isConnectionDisconnected() {
    return this.getConnectionState() === ConnectionState.DISCONNECTED;
  }

  isVideoContact() {
    return (
      this.currentContact.getContactSubtype() === 'connect:WebRTC' &&
      this.currentContact.hasVideoRTCCapabilities() &&
      this.currentAgent.getPermissions().includes('videoContact')
    );
  }

  agentHasVideoPermission() {
    return this.currentAgent.getPermissions().includes('videoContact');
  }

  shouldRenderLocalVideo() {
    return this.isVideoContact() && this.currentContact.canAgentSendVideo();
  }

  shouldRenderRemoteVideo() {
    return this.isVideoContact() && this.currentContact.canAgentReceiveVideo();
  }

  setupDeviceController() {
    this.logger = new ConsoleLogger('ChimeMeetingLogs', LogLevel.INFO);
    this.deviceController = new DefaultDeviceController(this.logger);
  }

  async setupChimeMeetingSession(contact) {
    // Get Chime meeting details from Amazon Connect
    const { attendee, meeting } = await contact.getAgentConnection().getVideoConnectionInfo();
    const configuration = new MeetingSessionConfiguration(meeting, attendee);
    this.meetingSession = new DefaultMeetingSession(configuration, this.logger, this.deviceController);
  }

  async listCameraDevices() {
    return await this.deviceController.listVideoInputDevices();
  }

  async selectCamera() {
    const cameraDevices = await this.listCameraDevices();

    let defaultCamera = cameraDevices[0].deviceId;
    if (this.isVideoFxProcessorSupported) {
      defaultCamera = new DefaultVideoTransformDevice(this.logger, defaultCamera, [this.videoFxProcessor]);
    }

    this.selectedCamera = defaultCamera;
  }

  subscribeToLocalVideo(localVideoElement) {
    const observer = {
      videoTileDidUpdate: (tileState) => {
        // Ignore a tile without attendee ID and other attendee's tile.
        if (!tileState.boundAttendeeId || !tileState.localTile) return;
        this.meetingSession.audioVideo.bindVideoElement(tileState.tileId, localVideoElement);
      },
    };

    this.meetingSession.audioVideo.addObserver(observer);
  }

  subscribeToRemoteVideo(remoteVideoElement) {
    const observer = {
      videoTileDidUpdate: (tileState) => {
        // Ignore a tile without attendee ID, a local tile (your video), and a content share.
        if (!tileState.boundAttendeeId || tileState.localTile || tileState.isContent) return;
        this.meetingSession.audioVideo.bindVideoElement(tileState.tileId, remoteVideoElement);
      },
    };

    this.meetingSession.audioVideo.addObserver(observer);
  }

  async toggleVideo() {
    if (this.canStartLocalVideo()) {
      await this.meetingSession.audioVideo.startVideoInput(this.selectedCamera);
      this.meetingSession.audioVideo.startLocalVideoTile();
    } else {
      this.meetingSession.audioVideo.stopLocalVideoTile();
    }
  }

  toggleMicrophone() {
    this.isAgentMuted ? this.currentAgent.unmute() : this.currentAgent.mute();
  }

  async startVideoPreview(videoPreviewElement) {
    await this.deviceController.startVideoInput(this.selectedCamera);
    this.deviceController.startVideoPreviewForVideoInput(videoPreviewElement);
  }

  async toggleVideoBackgroundBlur() {
    contactManager.videoFxConfig.backgroundBlur.isEnabled ^= true;
    await contactManager.videoFxProcessor.setEffectConfig(contactManager.videoFxConfig);
  }

  canStartLocalVideo() {
    return !this.meetingSession.audioVideo.hasStartedLocalVideoTile();
  }

  canMuteMicrophone() {
    return !this.meetingSession.audioVideo.realtimeIsLocalAudioMuted();
  }

  endContact() {
    this.currentContact.clear();
  }

  hangUpAgent() {
    this.currentContact.getAgentConnection().destroy({
      success: () => console.log('Successfully hang up agent connection'),
      failure: (err) => {
        console.error('Failed to hang up agent connection', err);
      },
    });
  }
}

const contactManager = new ContactManager();

export default contactManager;
