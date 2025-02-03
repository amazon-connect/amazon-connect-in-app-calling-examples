//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import contactManager from '../../../../../../services/ContactManager';
import eventBus from '../../../../../../utils/EventBus';

class MicButton extends HTMLElement {
  constructor() {
    super();
    this.isMuted = contactManager.isAgentMuted;
  }

  get micButton() {
    return this.querySelector('#mic-button');
  }

  connectedCallback() {
    this.render();
    this.attachEvents();
    eventBus.on('AgentMuteToggle', (event) => {
      this.updateIsMuted(event.detail);
    });
  }

  attachEvents() {
    this.micButton.addEventListener('click', () => this.handleClick());
  }

  handleClick() {
    contactManager.toggleMicrophone();
    this.isMuted = !this.isMuted;
    this.updateLabel();
  }

  updateIsMuted(isMuted) {
    this.isMuted = isMuted;
    this.updateLabel();
  }

  updateLabel() {
    this.micButton.textContent = this.isMuted ? 'Unmute' : 'Mute';
  }

  render() {
    this.innerHTML = `
      <style>
        #mic-button {
          height: 50px;
        }
      </style>

      <button id="mic-button" ></button>
    `;
    this.updateLabel();
  }
}

customElements.define('mic-button', MicButton);
