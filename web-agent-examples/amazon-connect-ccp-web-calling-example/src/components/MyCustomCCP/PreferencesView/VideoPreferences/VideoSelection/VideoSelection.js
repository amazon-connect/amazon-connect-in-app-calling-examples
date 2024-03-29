//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import contactManager from '../../../../../services/ContactManager';

class VideoSelection extends HTMLElement {
  constructor() {
    super();
    this.cameraDevices = [];
  }

  get videoSelect() {
    return this.querySelector('#video-select');
  }

  connectedCallback() {
    this.render();
    this.populateCameraDevices();
  }

  attachEvent() {
    this.videoSelect.addEventListener('change', async (event) => {
      const selectedDeviceId = event.target.value;

      if (contactManager.isVideoFxProcessorSupported) {
        contactManager.selectedCamera = contactManager.selectedCamera.chooseNewInnerDevice(selectedDeviceId);
      } else {
        contactManager.selectedCamera = selectedDeviceId;
      }

      const videoPreview = document.querySelector('#video-preview');
      contactManager.startVideoPreview(videoPreview);
    });
  }

  async populateCameraDevices() {
    const devices = await contactManager.listCameraDevices();
    this.setCameraDevices(devices);
  }

  setCameraDevices(cameraDevices) {
    this.cameraDevices = cameraDevices;
    this.render();
  }

  render() {
    this.innerHTML = `
      <style>
        #video-selection {

        }
      </style>

        <fieldset id="video-selection">
          <legend for="video-select">Camera Device</legend>
          <select id="video-select" value=${contactManager.selectCamera.deviceId}>
            ${this.cameraDevices
              .map((device) => `<option value="${device.deviceId}">${device.label}</option>`)
              .join('')}
          </select>
        </fieldset>
    `;
    this.attachEvent();
  }
}

customElements.define('video-selection', VideoSelection);
