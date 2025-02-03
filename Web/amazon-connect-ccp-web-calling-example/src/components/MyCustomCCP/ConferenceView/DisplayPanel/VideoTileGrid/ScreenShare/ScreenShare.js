//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import contactManager from '../../../../../../services/ContactManager';
import eventBus from '../../../../../../utils/EventBus';

class ScreenShare extends HTMLElement {
  constructor() {
    super();
  }

  get screenShare() {
    return this.querySelector('#screen-share');
  }

  connectedCallback() {
    this.render();
    contactManager.subscribeToScreenShare(this.screenShare);
    eventBus.on('ScreenSharingStateChanged', () => {
      this.updateStyles();
    });
  }

  updateStyles() {
    this.style.display = contactManager.isScreenSharingSessionStarted ? 'inline-block' : 'none';
  }

  render() {
    this.innerHTML = `
      <style>
        #screen-share {
          height: 300px;
          width: 400px;
          background-color: grey;
          position: absolute;
          top: 100px;
          box-sizing: border-box;
        }
      </style>

      <video id="screen-share"></video>
    `;
    this.updateStyles();
  }
}

customElements.define('screen-share', ScreenShare);
