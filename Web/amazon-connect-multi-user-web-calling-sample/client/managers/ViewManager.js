/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

/**
 * ViewManager - Controls view transitions between application screens
 */
import { joinFormView } from "../views/JoinFormView.js";
import { sessionView } from "../views/SessionView.js";

// View type enum
export const VIEW_TYPE = {
  CREATE: "create",
  JOIN: "join",
  ENGAGEMENT: "engagement",
};

class ViewManager {
  // Handle transition between different application views
  switchToView(viewType) {
    console.log(`[ViewManager] Switching to view: ${viewType}`);
    
    // Handle view-specific transitions
    switch (viewType) {
      case VIEW_TYPE.CREATE:
        joinFormView.showCreateView();
        sessionView.hideSessionView();
        break;
        
      case VIEW_TYPE.JOIN:
        joinFormView.showJoinView();
        sessionView.hideSessionView();
        break;
        
      case VIEW_TYPE.ENGAGEMENT:
        joinFormView.hideJoinFormContainer();
        sessionView.showSessionView();
        break;
        
      default:
        console.error(`[ViewManager] Unknown view type: ${viewType}`);
    }
  }
}

export const viewManager = new ViewManager();
