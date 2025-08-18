/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

// DynamoDB service for engagement data management
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const logger = require("./logger");

const client = new DynamoDBClient();

// Create a document client for easier JSON handling
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

// Get the table name from environment variable
const tableName = process.env.DYNAMODB_ENGAGEMENTS_TABLE;
logger.info(`[DynamoDbService] Table name: ${tableName}`);

const calculateTtl = () => {
  // 24 hours from now in seconds
  return Math.floor(Date.now() / 1000) + 24 * 60 * 60;
};

/**
 * Get engagement data by ID
 * @param {string} engagementId - The engagement ID to retrieve
 * @returns {Promise<Object|undefined>} Engagement data or undefined if not found
 */
const getEngagement = async (engagementId) => {
  logger.debug(`[DynamoDbService.getEngagement] ID: ${engagementId}`);

  try {
    const command = new GetCommand({
      TableName: tableName,
      Key: { engagement_id: engagementId },
    });

    const response = await docClient.send(command);

    if (!response.Item) {
      logger.info(`[DynamoDbService.getEngagement] Not found: ${engagementId}`);
      return undefined;
    }

    // Convert snake_case keys to camelCase for API consistency
    const result = {
      engagementId,
      participants: response.Item.participants,
      contactId: response.Item.contact_id,
      contactStatus: response.Item.contact_status,
    };

    logger.debug(`Successfully retrieved engagement: ${engagementId}`, {
      result,
    });
    return result;
  } catch (error) {
    logger.error(`Error getting engagement from DynamoDB: ${error.message}`, {
      engagementId,
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
    });
    throw error;
  }
};

/**
 * Create engagement data
 * @param {string} engagementId - The engagement ID
 * @param {Object} data - Engagement data to store
 * @throws {Error} Throws ConditionalCheckFailedException if engagement already exists
 */
const createEngagement = async (engagementId, data) => {
  logger.debug(`[DynamoDbService.createEngagement] ID: ${engagementId}`, {
    engagementId,
    data,
  });

  if (!engagementId || !data) {
    logger.warn("Invalid engagement data provided", { engagementId, data });
    throw new Error("Engagement ID and data are required");
  }

  try {
    // Convert camelCase keys to snake_case for DynamoDB
    const item = {
      engagement_id: engagementId,
      participants: data.participants,
      contact_id: data.contactId,
      contact_status: data.contactStatus,
      updated_at: new Date().toISOString(),
      ttl: calculateTtl(), // Add TTL for 24 hours
    };

    const command = new PutCommand({
      TableName: tableName,
      Item: item,
      // Conditional expression: only create if engagement_id doesn't exist
      ConditionExpression: "attribute_not_exists(engagement_id)",
    });

    await docClient.send(command);
    logger.info(`Successfully created engagement: ${engagementId}`);
  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      logger.warn(`Engagement ${engagementId} already exists`);
      throw new Error(`Engagement ${engagementId} already exists`);
    }
    logger.error(`Error creating engagement in DynamoDB: ${error.message}`, {
      engagementId,
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
    });
    throw error;
  }
};

const updateEngagement = async (engagementId, updates) => {
  logger.debug(`[DynamoDbService.updateEngagement] ID: ${engagementId}`, {
    engagementId,
    updates,
  });

  if (!engagementId || !updates) {
    logger.warn("Invalid update data provided", { engagementId, updates });
    throw new Error("Engagement ID and updates are required");
  }

  try {
    // First check if the engagement exists
    const existingEngagement = await getEngagement(engagementId);
    if (!existingEngagement) {
      logger.warn(`Cannot update non-existent engagement: ${engagementId}`);
      return;
    }

    // Build update expression and attribute values
    const updateExpressionParts = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    // Map camelCase keys to snake_case for DynamoDB
    if (updates.participants) {
      updateExpressionParts.push("#participants = :participants");
      expressionAttributeNames["#participants"] = "participants";
      expressionAttributeValues[":participants"] = updates.participants;
    }

    if (updates.contactId !== undefined) {
      updateExpressionParts.push("#contact_id = :contact_id");
      expressionAttributeNames["#contact_id"] = "contact_id";
      expressionAttributeValues[":contact_id"] = updates.contactId;
    }

    if (updates.contactStatus !== undefined) {
      updateExpressionParts.push("#contact_status = :contact_status");
      expressionAttributeNames["#contact_status"] = "contact_status";
      expressionAttributeValues[":contact_status"] = updates.contactStatus;
    }

    // Add updated_at timestamp
    updateExpressionParts.push("#updated_at = :updated_at");
    expressionAttributeNames["#updated_at"] = "updated_at";
    expressionAttributeValues[":updated_at"] = new Date().toISOString();

    const command = new UpdateCommand({
      TableName: tableName,
      Key: { engagement_id: engagementId },
      UpdateExpression: `SET ${updateExpressionParts.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    });

    await docClient.send(command);
    logger.info(`Successfully updated engagement: ${engagementId}`);
  } catch (error) {
    logger.error(`Error updating engagement in DynamoDB: ${error.message}`, {
      engagementId,
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
    });
    throw error;
  }
};

module.exports = {
  getEngagement,
  createEngagement,
  updateEngagement,
};
