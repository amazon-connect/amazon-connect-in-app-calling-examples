//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import './BackgroundBlur/BackgroundBlur.js';

class VideoEnhancements extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <style>
        #video-enhancements {

        }
      </style>

        <fieldset id="video-enhancements">
        <legend>Video Enhancements</legend>
          <background-blur></background-blur>
        </fieldset>
    `;
  }
}

customElements.define('video-enhancements', VideoEnhancements);
