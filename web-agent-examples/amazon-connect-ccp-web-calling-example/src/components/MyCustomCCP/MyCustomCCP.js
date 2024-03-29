//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import './ConferenceView/ConferenceView.js';
import './PreferencesView/PreferencesView.js';

class MyCustomCCP extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <style>
        #my-custom-ccp {
          display: flex;
          background-color: black;
        }
      </style>

      <h1>My Custom CCP</h1>
      <div id="my-custom-ccp">
        <conference-view></conference-view>
        <preferences-view></preferences-view>
      </div>
    `;
  }
}

customElements.define('my-custom-ccp', MyCustomCCP);
