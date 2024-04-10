//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import contactManager from '../../../../../../services/ContactManager';

class HangUpButton extends HTMLElement {
  constructor() {
    super();
  }

  get hangUpButton() {
    return this.querySelector('#hang-up-button');
  }

  connectedCallback() {
    this.render();
    this.attachEvents();
  }

  attachEvents() {
    this.hangUpButton.addEventListener('click', () => {
      contactManager.hangUpAgent();
    });
  }

  render() {
    this.innerHTML = `
      <style>
        #hang-up-button {
          height: 50px;
        }
      </style>

      <button id="hang-up-button">Hang up</button>
    `;
  }
}

customElements.define('hang-up-button', HangUpButton);
