//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import contactManager from '../../../../../services/ContactManager';

class VideoPreview extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
    this.startVideoPreview();
  }

  get videoPreview() {
    return this.querySelector('#video-preview');
  }

  async startVideoPreview() {
    await contactManager.startVideoPreview(this.videoPreview);
  }

  render() {
    this.innerHTML = `
      <style>
        #video-preview {
          background-color: lightgrey;
          width: 100%;
          height: 300px;
          object-fit: cover;
        }
      </style>

      <fieldset id="video-selection">
        <legend for="video-select">Video Preview</legend>
        <video id="video-preview" >
      <fieldset/>
      </video>
    `;
  }
}

customElements.define('video-preview', VideoPreview);
