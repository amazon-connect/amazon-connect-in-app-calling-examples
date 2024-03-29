//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import './AgentStatus/AgentStatus';

class StatusBar extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <style>
        #status-bar {
          width: 400px;
          height: 50px;
          background-color: lightgrey;
          display: flex;
          justify-content: space-around;
          align-items: center;
        }
      </style>

      <div id="status-bar" >
        <agent-status></agent-status>
      </div>
    `;
  }
}

customElements.define('status-bar', StatusBar);
