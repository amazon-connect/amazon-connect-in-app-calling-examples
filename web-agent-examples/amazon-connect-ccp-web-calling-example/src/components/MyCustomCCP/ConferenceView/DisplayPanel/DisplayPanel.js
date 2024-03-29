//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import contactManager from '../../../../services/ContactManager.js';
import eventBus from '../../../../utils/EventBus.js';
import './VideoTileGrid/VideoTileGrid.js';
import './ControlBar/ControlBar.js';

class DisplayPanel extends HTMLElement {
  constructor() {
    super();
    this.shouldRenderVideoUi = false;
    this.isContactActive = false;
    this.isConnectionActive = false;
  }

  connectedCallback() {
    this.render();
    eventBus.on('ContactConnected', () => {
      this.shouldRenderVideoUi = contactManager.isVideoContact();
      this.isContactActive = true;
      this.isConnectionActive = true;
      this.render();
    });
    eventBus.on('ContactACW', () => {
      this.shouldRenderVideoUi = false;
      this.isContactActive = true;
      this.isConnectionActive = false;
      this.render();
    });
    eventBus.on('ContactDestroy', () => {
      this.shouldRenderVideoUi = false;
      this.isContactActive = false;
      this.isConnectionActive = false;
      this.render();
    });
  }

  renderContent() {
    return `
      <div id="content">
        ${this.isConnectionActive ? this.renderVideoTileGrid() : ''}
      </div>`;
  }

  renderVideoTileGrid() {
    return `${
      this.shouldRenderVideoUi
        ? '<video-tile-grid></video-tile-grid>'
        : 'Not a video contact, do not render video tile grid.'
    }`;
  }

  renderControlBar() {
    return `<control-bar is-connection-active="${this.isConnectionActive}"></control-bar>`;
  }

  render() {
    this.innerHTML = `
      <style>
        #display-panel {
          width: 400px;
          height: 450px;
          background-color: grey;
        }
  
        #content {
          height: 400px;
        }
      </style>
  
      <div id="display-panel">
        ${
          this.isContactActive
            ? `
              ${this.renderContent()}
              ${this.renderControlBar()}
            `
            : ''
        }
      </div>`;
  }
}

customElements.define('display-panel', DisplayPanel);
