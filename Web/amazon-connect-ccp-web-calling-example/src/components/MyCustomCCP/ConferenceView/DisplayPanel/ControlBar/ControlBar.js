//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import contactManager from '../../../../../services/ContactManager.js';
import './VideoButton/VideoButton.js';
import './MicButton/MicButton.js';
import './HangUpButton/HangUpButton.js';
import './ScreenSharingSessionButton/ScreenSharingSessionButton.js';
import './ScreenShareButton/ScreenShareButton.js';
import './EndContactButton/EndContactButton.js';

class ControlBar extends HTMLElement {
  static observedAttributes = ['is-connection-active'];

  constructor() {
    super();
    this.isConnectionActive = false;
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'is-connection-active') {
      this.isConnectionActive = newValue === 'true';
      this.render();
    }
  }

  render() {
    this.innerHTML = `
      <style>
        #control-bar {
          width: 400px;
          height: 50px;
          background-color: lightgrey;
          display: flex;
          justify-content: space-around;
          align-items: center;
        }
      </style>
  
      <div id="control-bar" >
        ${
          this.isConnectionActive
            ? `
              <mic-button></mic-button>
              ${contactManager.shouldRenderLocalVideo() ? '<video-button></video-button>' : ''}
              <screen-sharing-session-button></screen-sharing-session-button>
              <screen-share-button></screen-share-button>
              <hang-up-button></hang-up-button>`
            : '<end-contact-button></end-contact-button>'
        }
      </div>
    `;
  }
}

customElements.define('control-bar', ControlBar);
