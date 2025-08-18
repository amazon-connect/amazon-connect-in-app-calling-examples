/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

// Main server entry point for the multiparty sample application
// Sets up Express server with API routes for engagement management
const express = require("express");
const cors = require("cors");
const path = require("path");
const engagementRoutes = require("./routes/engagementRoutes");
const { config } = require("./config/config");

const app = express();

// Middleware for CORS and JSON parsing
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/", engagementRoutes);

// Start server
app.listen(config.server.port, () => {
  console.log(`[Server] Running on port ${config.server.port}`);
});
