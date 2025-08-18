/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

/**
 * EventBus - Simple event bus implementation for inter-component communication
 * Allows components to subscribe to and publish events without direct dependencies
 */

class EventBus {
  constructor() {
    this.subscribers = {};
  }

  // Register callback for an event and return unsubscribe function
  subscribe(event, callback) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = new Set();
    }

    this.subscribers[event].add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers[event].delete(callback);
      if (this.subscribers[event].size === 0) {
        delete this.subscribers[event];
      }
    };
  }

  // Trigger event and notify all subscribers with data
  publish(event, data) {
    if (!this.subscribers[event]) {
      return;
    }

    this.subscribers[event].forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event subscriber for ${event}:`, error);
      }
    });
  }

  // Remove all subscribers for specified event or all events
  clear(event) {
    if (event) {
      delete this.subscribers[event];
    } else {
      this.subscribers = {};
    }
  }
}

// Create a singleton instance
export const eventBus = new EventBus();
