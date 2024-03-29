//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import contactManager from '../../../../../../services/ContactManager';

class VideoButton extends HTMLElement {
  constructor() {
    super();
    this.label = 'Turn on video';
  }

  get videoButton() {
    return this.querySelector('#video-button');
  }

  connectedCallback() {
    this.render();
    this.attachEvents();
  }

  attachEvents() {
    this.videoButton.addEventListener('click', async () => {
      await contactManager.toggleVideo();
      this.updateLabel();
    });
  }

  updateLabel() {
    this.label = this.label === 'Turn on video' ? 'Turn off video' : 'Turn on video';
    this.videoButton.innerHTML = this.label;
  }

  render() {
    this.innerHTML = `
      <style>
        #video-button {
          height: 50px;
        }
      </style>

      <button id="video-button" >
        ${this.label}
      </button>
    `;
  }
}

customElements.define('video-button', VideoButton);
