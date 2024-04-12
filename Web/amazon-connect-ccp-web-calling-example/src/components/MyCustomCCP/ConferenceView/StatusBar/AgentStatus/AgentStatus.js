//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import eventBus from '../../../../../utils/EventBus';

class AgentStatus extends HTMLElement {
  constructor() {
    super();
    this.status = 'Pending';
  }

  get agentStatus() {
    return this.querySelector('#agent-status');
  }

  connectedCallback() {
    this.render();
    eventBus.on('AgentRefresh', (event) => this.updateStatus(event.detail));
  }

  updateStatus(status) {
    this.status = status;
    this.render();
  }

  render() {
    this.innerHTML = `
      <div id="agent-status" >
        <div>Agent Status: ${this.status}</div>
      </div>
    `;
  }
}

customElements.define('agent-status', AgentStatus);
