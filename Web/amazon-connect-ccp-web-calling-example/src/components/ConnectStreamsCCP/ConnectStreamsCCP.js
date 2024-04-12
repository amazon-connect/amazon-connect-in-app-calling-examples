//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import contactManager from '../../services/ContactManager';

class ConnectStreamsCCP extends HTMLElement {
  constructor() {
    super();
    this.isHidden = false;
  }

  get connectStreamsCCP() {
    return this.querySelector('#connect-streams-ccp');
  }

  get toggleCCPButton() {
    return this.querySelector('#toggle-ccp-button');
  }

  connectedCallback() {
    this.render();
    this.initConnectService();
    this.attachEvents();
    this.updateLabel();
  }

  attachEvents() {
    this.toggleCCPButton.addEventListener('click', () => {
      this.toggleCCP();
      this.updateLabel();
    });
  }

  updateLabel() {
    this.toggleCCPButton.innerHTML = this.isHidden ? 'Display' : 'Hide';
  }

  async initConnectService() {
    await contactManager.init();
  }

  toggleCCP() {
    this.connectStreamsCCP.style.display = this.isHidden ? 'block' : 'none';
    this.isHidden = !this.isHidden;
  }

  render() {
    this.innerHTML = `
      <style>
        #connect-streams-ccp-title{
          width: 400px;
        }

        #toggle-ccp-button{
          vertical-align: middle;
        }

        #connect-streams-ccp {
          width: 400px;
          height: 500px;
        }

        #connect-streams-ccp iframe{
          border: none;
        }
      </style>

      <h1 id="connect-streams-ccp-title">Connect Streams CCP
        <button id="toggle-ccp-button"></button>
      </h1>
      <div id="connect-streams-ccp" />
    `;
  }
}

customElements.define('connect-streams-ccp', ConnectStreamsCCP);
