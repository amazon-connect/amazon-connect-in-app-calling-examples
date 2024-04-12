//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import contactManager from '../../../../services/ContactManager.js';
import './VideoEnhancements/VideoEnhancements.js';
import './VideoPreview/VideoPreview.js';
import './VideoSelection/VideoSelection.js';

class VideoPreferences extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <style>
        #video-preferences {
          box-sizing: border-box;
          height: 500px;
        }
      </style>
  
      <fieldset id="video-preferences">
        <legend>Video Preferences</legend>
        ${
          contactManager.agentHasVideoPermission()
            ? `
              <video-preview></video-preview>
              <video-selection></video-selection>
              ${contactManager.isVideoFxProcessorSupported ? '<video-enhancements></video-enhancements>' : ''}
            `
            : 'Video preferences cannot be accessed as the agent does not have permission for video calls.'
        }
      </fieldset>
    `;
  }
}

customElements.define('video-preferences', VideoPreferences);
