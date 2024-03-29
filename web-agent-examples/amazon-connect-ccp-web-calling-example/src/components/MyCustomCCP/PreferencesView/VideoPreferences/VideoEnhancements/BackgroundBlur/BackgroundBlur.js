//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import contactManager from '../../../../../../services/ContactManager';

class BackgroundBlur extends HTMLElement {
  constructor() {
    super();
  }

  get backgroundBlurCheckbox() {
    return this.querySelector('#background-blur-checkbox');
  }

  connectedCallback() {
    this.render();
    this.attachEvent();
  }

  attachEvent() {
    this.backgroundBlurCheckbox.addEventListener('change', async (event) => {
      await contactManager.toggleVideoBackgroundBlur();
    });
  }

  render() {
    this.innerHTML = `
      <style>
        #background-blur {

        }
      </style>

        <div id="background-blur">
          <input id="background-blur-checkbox" type="checkbox" checked />
          <label for="background-blur-checkbox">Background blur</label>
        </div>
    `;
  }
}

customElements.define('background-blur', BackgroundBlur);
