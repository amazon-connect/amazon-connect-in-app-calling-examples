/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

/**
 * DynamoDB engagement data access layer
 */
const {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
} = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const { config } = require("../config/config");

const ENGAGEMENTS_TABLE = config.database.tableName;

// Initialize DynamoDB client
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

// Check if the engagements table exists
const tableExists = async () => {
  try {
    const command = new DescribeTableCommand({
      TableName: ENGAGEMENTS_TABLE,
    });
    await client.send(command);
    return true;
  } catch (error) {
    if (error.name === "ResourceNotFoundException") {
      return false;
    }
    throw error;
  }
};

// Create the engagements table if it doesn't exist
const createTableIfNotExists = async () => {
  try {
    const exists = await tableExists();

    if (!exists) {
      console.log(`Creating DynamoDB table: ${ENGAGEMENTS_TABLE}`);

      const command = new CreateTableCommand({
        TableName: ENGAGEMENTS_TABLE,
        AttributeDefinitions: [
          {
            AttributeName: "engagement_id",
            AttributeType: "S",
          },
        ],
        KeySchema: [
          {
            AttributeName: "engagement_id",
            KeyType: "HASH",
          },
        ],
        BillingMode: "PAY_PER_REQUEST",
      });

      await client.send(command);

      // Wait for table to be created
      console.log(`Waiting for table ${ENGAGEMENTS_TABLE} to be created...`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      console.log(`Table ${ENGAGEMENTS_TABLE} created successfully`);
    } else {
      console.log(`DynamoDB table ${ENGAGEMENTS_TABLE} already exists`);
    }
  } catch (error) {
    console.error("Error creating DynamoDB table:", error);
    throw error;
  }
};

// Get engagement data by ID
const getEngagement = async (engagementId) => {
  try {
    const command = new GetCommand({
      TableName: ENGAGEMENTS_TABLE,
      Key: { engagement_id: engagementId },
    });

    const response = await docClient.send(command);

    if (!response.Item) {
      return undefined;
    }

    return {
      engagementId,
      participants: response.Item.participants,
      contactId: response.Item.contact_id,
      contactStatus: response.Item.contact_status,
    };
  } catch (error) {
    console.error("Error getting engagement from DynamoDB:", error);
    return undefined;
  }
};

// Create engagement data
const createEngagement = async (engagementId, data) => {
  if (!engagementId || !data) {
    console.warn("Invalid engagement data provided");
    return;
  }

  try {
    const item = {
      engagement_id: engagementId,
      participants: data.participants,
      contact_id: data.contactId,
      contact_status: data.contactStatus,
      updated_at: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: ENGAGEMENTS_TABLE,
      Item: item,
      ConditionExpression: "attribute_not_exists(engagement_id)",
    });

    await docClient.send(command);
  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      console.warn(`Engagement ${engagementId} already exists`);
      throw new Error(`Engagement ${engagementId} already exists`);
    }
    console.error("Error setting engagement in DynamoDB:", error);
    throw error;
  }
};

// Update existing engagement data
const updateEngagement = async (engagementId, updates) => {
  if (!engagementId || !updates) {
    console.error("Engagement ID and data are required");
    throw new Error("Engagement ID and data are required");
  }

  try {
    // First check if the engagement exists
    const existingEngagement = await getEngagement(engagementId);
    if (!existingEngagement) {
      return;
    }

    // Build update expression and attribute values
    const updateExpressionParts = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

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
      TableName: ENGAGEMENTS_TABLE,
      Key: { engagement_id: engagementId },
      UpdateExpression: `SET ${updateExpressionParts.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    });

    await docClient.send(command);
  } catch (error) {
    console.error("Error updating engagement in DynamoDB:", error);
    throw error;
  }
};

module.exports = {
  getEngagement,
  createEngagement,
  updateEngagement,
  createTableIfNotExists,
};
