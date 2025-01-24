//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import contactManager from '../../../../../../services/ContactManager';
import eventBus from '../../../../../../utils/EventBus';

class ScreenShareButton extends HTMLElement {
  constructor() {
    super();
    this.label = 'Share screen';
  }

  get screenShareButton() {
    return this.querySelector('#screen-share-button');
  }

  connectedCallback() {
    this.render();
    eventBus.on('ScreenSharingStateChanged', () => {
      this.updateStyles();
      this.updateLabel();
    });
  }

  attachEvents() {
    this.screenShareButton.addEventListener('click', async () => {
      await contactManager.toggleScreenShare();
      this.updateLabel();
    });
  }

  updateLabel() {
    this.label = contactManager.isLocalUserSharing ? 'Stop share' : 'Share screen';
    this.screenShareButton.innerHTML = this.label;
  }

  updateStyles() {
    this.style.display = contactManager.isScreenSharingSessionStarted ? 'inline-block' : 'none';
  }

  render() {
    this.innerHTML = `
      <style>
        #screen-share-button {
          height: 50px;
        }
      </style>

      <button id="screen-share-button" >
        ${this.label}
      </button>
    `;
    this.attachEvents();
    this.updateStyles();
  }
}

customElements.define('screen-share-button', ScreenShareButton);
