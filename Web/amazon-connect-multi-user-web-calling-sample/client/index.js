/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

// Main entry point for the application
// Initializes the application when the DOM is fully loaded
import { joinFormController } from "./controllers/JoinFormController.js";
import { sessionController } from "./controllers/SessionController.js";
import { stateManager } from "./managers/StateManager.js";

// Resets application state and initializes all controllers
const initializeApp = async () => {
  // Reset state
  stateManager.resetState();

  // Initialize controllers
  joinFormController.initialize();
  sessionController.initialize();
};

// Start the application when DOM is loaded
document.addEventListener("DOMContentLoaded", initializeApp);
