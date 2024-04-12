//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import 'amazon-connect-streams';

import './components/MyCustomCCP/MyCustomCCP.js';
import './components/ConnectStreamsCCP/ConnectStreamsCCP.js';

class MyApp extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <style>
        #my-app {
          margin: auto;
          display: flex;
          justify-content: space-evenly;
        }
      </style>

      <div id="my-app">
        <connect-streams-ccp></connect-streams-ccp>
        <my-custom-ccp></my-custom-ccp>
      </div>
    `;
  }
}

customElements.define('my-app', MyApp);

// Subscribe to the /esbuild server-sent event source to get live reloading: https://esbuild.github.io/api/#live-reload
new EventSource('/esbuild').addEventListener('change', () => location.reload());
