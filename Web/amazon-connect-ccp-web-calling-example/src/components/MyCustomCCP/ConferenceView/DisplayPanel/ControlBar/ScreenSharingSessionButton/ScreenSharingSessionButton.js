//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import contactManager from '../../../../../../services/ContactManager';
import eventBus from '../../../../../../utils/EventBus';

class ScreenSharingSessionButton extends HTMLElement {
  constructor() {
    super();
  }

  get screenShareButton() {
    return this.querySelector('#screen-sharing-session-button');
  }

  connectedCallback() {
    this.render();

    eventBus.on('ScreenSharingStateChanged', () => {
      this.render();
    });
  }

  attachEvents() {
    this.screenShareButton.addEventListener('click', async () => {
      await contactManager.toggleScreenSharingSession();
    });
  }

  render() {
    this.innerHTML = `
      <style>
        #screen-sharing-session-button {
          height: 50px;
        }
      </style>

      <button id="screen-sharing-session-button">
        ${contactManager.isScreenSharingSessionStarted ? 'End sharing session' : 'Start sharing session'}
      </button>
    `;
    this.attachEvents();
  }
}

customElements.define('screen-sharing-session-button', ScreenSharingSessionButton);
