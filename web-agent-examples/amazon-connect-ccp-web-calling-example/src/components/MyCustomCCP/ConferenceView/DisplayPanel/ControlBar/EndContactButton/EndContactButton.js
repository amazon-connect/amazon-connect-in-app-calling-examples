//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import contactManager from '../../../../../../services/ContactManager';

class EndContactButton extends HTMLElement {
  constructor() {
    super();
  }

  get endContactButton() {
    return this.querySelector('#end-contact-button');
  }

  connectedCallback() {
    this.render();
    this.attachEvents();
  }

  attachEvents() {
    this.endContactButton.addEventListener('click', () => {
      contactManager.endContact();
    });
  }

  render() {
    this.innerHTML = `
      <style>
        #end-contact-button {
          height: 50px;
        }
      </style>

      <button id="end-contact-button">End contact</button>
    `;
  }
}

customElements.define('end-contact-button', EndContactButton);
