//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import './DisplayPanel/DisplayPanel.js';
import './StatusBar/StatusBar.js';

class ConferenceView extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <style>
        #conference-view {
          display: flex;
          flex-direction: column;
        }
      </style>

      <div id="conference-view" >
        <status-bar></status-bar>
        <display-panel></display-panel>
      </div>
    `;
  }
}

customElements.define('conference-view', ConferenceView);
