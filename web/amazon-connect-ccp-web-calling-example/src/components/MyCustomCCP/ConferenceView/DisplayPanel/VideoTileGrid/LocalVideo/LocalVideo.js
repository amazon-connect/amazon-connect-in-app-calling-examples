//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import contactManager from '../../../../../../services/ContactManager';

class LocalVideo extends HTMLElement {
  constructor() {
    super();
  }

  get localVideo() {
    return this.querySelector('#local-video');
  }

  connectedCallback() {
    this.render();
    contactManager.subscribeToLocalVideo(this.localVideo);
  }

  render() {
    this.innerHTML = `
      <style>
        #local-video {
          height: 150px;
          width: 100px;
          object-fit: cover;
          background-color: black;
          position: absolute;  
          top: 10px;
          right: 10px;
          border: 1px solid white;
          border-radius: 5px;
        }
      </style>

      <video id="local-video" ></video>
    `;
  }
}

customElements.define('local-video', LocalVideo);
