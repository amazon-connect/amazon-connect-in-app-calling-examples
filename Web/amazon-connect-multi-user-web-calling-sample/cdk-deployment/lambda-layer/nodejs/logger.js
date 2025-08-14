/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

// Logger module for standardized logging across lambda functions
const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
};

/**
 * Format a log message with timestamp, level, and additional context
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} [context] - Additional context data
 * @returns {string} Formatted log message
 */
const formatLogMessage = (level, message, context = {}) => {
  const timestamp = new Date().toISOString();
  const contextStr = Object.keys(context).length > 0 
    ? ` | ${JSON.stringify(context)}`
    : '';
  
  return `[${timestamp}] [${level}] ${message}${contextStr}`;
};

/**
 * Log a debug message
 * @param {string} message - Log message
 * @param {Object} [context] - Additional context data
 */
const debug = (message, context) => {
  console.debug(formatLogMessage(LogLevel.DEBUG, message, context));
};

/**
 * Log an info message
 * @param {string} message - Log message
 * @param {Object} [context] - Additional context data
 */
const info = (message, context) => {
  console.info(formatLogMessage(LogLevel.INFO, message, context));
};

/**
 * Log a warning message
 * @param {string} message - Log message
 * @param {Object} [context] - Additional context data
 */
const warn = (message, context) => {
  console.warn(formatLogMessage(LogLevel.WARN, message, context));
};

/**
 * Log an error message
 * @param {string} message - Log message
 * @param {Object} [context] - Additional context data
 */
const error = (message, context) => {
  console.error(formatLogMessage(LogLevel.ERROR, message, context));
};

module.exports = {
  LogLevel,
  debug,
  info,
  warn,
  error
};
