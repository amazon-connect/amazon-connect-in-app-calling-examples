/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

// Loads environment variables and provides a centralized configuration object
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Configuration object
const config = {
  server: {
    port: 3000,
  },
  database: {
    tableName: "engagements",
  },
  connect: {
    instanceId: process.env.CONNECT_INSTANCE_ID,
    contactFlowId: process.env.CONNECT_CONTACT_FLOW_ID,
  },
};

module.exports = {
  config,
};
