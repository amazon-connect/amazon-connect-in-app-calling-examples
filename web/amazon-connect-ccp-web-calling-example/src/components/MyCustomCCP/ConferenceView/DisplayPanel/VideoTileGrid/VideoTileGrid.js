//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import contactManager from '../../../../../services/ContactManager.js';
import './LocalVideo/LocalVideo.js';
import './RemoteVideo/RemoteVideo.js';

class VideoTileGrid extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <style>
        #video-tile-grid {
          width: 400px;
          height: 400px;
          background-color: grey;
          position: relative;
        }
      </style>

      <div id="video-tile-grid" >
      ${contactManager.shouldRenderLocalVideo() ? '<local-video></local-video>' : ''}
      ${contactManager.shouldRenderRemoteVideo() ? '<remote-video></remote-video>' : ''}
      </div>
    `;
  }
}

customElements.define('video-tile-grid', VideoTileGrid);