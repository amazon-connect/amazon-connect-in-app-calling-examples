//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

class EventBus extends EventTarget {
  constructor() {
    super();
  }

  emit(eventName, data) {
    const event = new CustomEvent(eventName, { detail: data });
    this.dispatchEvent(event);
  }

  on(eventName, callback) {
    this.addEventListener(eventName, callback);
  }

  off(eventName, callback) {
    this.removeEventListener(eventName, callback);
  }
}

const eventBus = new EventBus();
export default eventBus;
