//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import contactManager from '../../../../../../services/ContactManager';

class RemoteVideo extends HTMLElement {
  constructor() {
    super();
  }

  get remoteVideo() {
    return this.querySelector('#remote-video');
  }

  connectedCallback() {
    this.render();
    contactManager.subscribeToRemoteVideo(this.remoteVideo);
  }

  render() {
    this.innerHTML = `
      <style>
        #remote-video {
          height: 400px;
          width: 400px;
          object-fit: cover;
          background-color: black;
        }
      </style>

      <video id="remote-video" ></video>
    `;
  }
}

customElements.define('remote-video', RemoteVideo);
