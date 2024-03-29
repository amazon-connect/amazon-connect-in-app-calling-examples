//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import eventBus from '../../../utils/EventBus.js';
import './VideoPreferences/VideoPreferences.js';

class PreferencesView extends HTMLElement {
  constructor() {
    super();
    this.shouldRender = false;
  }

  connectedCallback() {
    this.render();
    eventBus.on('AgentInitialized', () => {
      this.setShouldRender(true);
    });
  }

  setShouldRender(shouldRender) {
    this.shouldRender = shouldRender;
    this.render();
  }

  render() {
    this.innerHTML = `
      <style>
        #preferences-view {
          background-color: darkgrey;
          width: 350px;
          height: 500px;
        }
      </style>

      <div id="preferences-view">
      ${this.shouldRender ? '<video-preferences></video-preferences>' : ''}
      </div>
    `;
  }
}

customElements.define('preferences-view', PreferencesView);
