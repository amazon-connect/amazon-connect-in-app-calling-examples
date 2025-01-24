//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import contactManager from '../../../../../../services/ContactManager';
import eventBus from '../../../../../../utils/EventBus';

class RemoteVideo extends HTMLElement {
  constructor() {
    super();
  }

  get remoteVideo() {
    return this.querySelector('#remote-video');
  }

  connectedCallback() {
    this.render();
    contactManager.subscribeToRemoteVideo(this.remoteVideo);

    eventBus.on('ScreenSharingStateChanged', () => {
      this.updateStyles();
    });
  }

  updateStyles() {
    this.remoteVideo.className = contactManager.isScreenSharingSessionStarted ? 'screen-sharing-on' : 'screen-sharing-off';
  }

  render() {
    this.innerHTML = `
      <style>
        #remote-video {
          object-fit: cover;
          background-color: black;
          box-sizing: border-box;
        }
        #remote-video.screen-sharing-off {
          height: 400px;
          width: 400px;
          object-fit: cover;
          background-color: black;
        }
        #remote-video.screen-sharing-on {
          height: 100px;
          width: 200px;
          top: 0px;
          left: 0px;
          border: 1px solid white;
          border-radius: 0;
          position: absolute;
        }
      </style>
      <video id="remote-video"></video>
    `;
    this.updateStyles();
  }
}

customElements.define('remote-video', RemoteVideo);
