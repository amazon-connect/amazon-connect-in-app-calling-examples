//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import contactManager from '../../../../../../services/ContactManager';
import eventBus from '../../../../../../utils/EventBus';

class LocalVideo extends HTMLElement {
  constructor() {
    super();
  }

  get localVideo() {
    return this.querySelector('#local-video');
  }

  connectedCallback() {
    this.render();
    contactManager.subscribeToLocalVideo(this.localVideo);

    eventBus.on('ScreenSharingStateChanged', () => {
      this.updateStyles();
    });
  }

  updateStyles() {
    this.localVideo.className = contactManager.isScreenSharingSessionStarted ? 'screen-sharing-on' : 'screen-sharing-off';
  }

  render() {
    this.innerHTML = `
      <style>
        #local-video {
          object-fit: cover;
          background-color: black;
          position: absolute;
          border: 1px solid white;
          box-sizing: border-box;
        }
        #local-video.screen-sharing-off {
          height: 150px;
          width: 100px;
          top: 10px;
          right: 10px;
          border-radius: 5px;
        }
        #local-video.screen-sharing-on {
          height: 100px;
          width: 200px;
          top: 0px;
          right: 0px;
          border-radius: 0;
        }
      </style>
      <video id="local-video"></video>
    `;
    this.updateStyles();
  }
}

customElements.define('local-video', LocalVideo);
