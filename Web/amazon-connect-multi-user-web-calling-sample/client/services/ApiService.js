/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

// ApiResponse - Represents a response from the API
class ApiResponse {
  constructor(data, error, statusCode = null) {
    this.data = data;
    this.error = error;
    this.statusCode = statusCode;
  }
}

/**
 * ApiService - Handles API communication with the backend
 * Provides methods for creating, joining, and managing engagements
 */
class ApiService {
  constructor() {
    // Set API base URL based on environment
    this.apiBaseUrl = "/api";
    if (window.location.hostname.includes("cloudfront.net")) {
      // Production (CloudFront)
      this.apiBaseUrl = "/api";
    } else {
      // Local development
      this.apiBaseUrl = "http://localhost:3000/api";
    }
  }

  /**
   * Generic API request handler with error handling
   * @returns {Promise<ApiResponse>} Response with data, error, and status code
   */
  async apiRequest(url, options, errorMessage) {
    const endpoint = url.split("/").pop();
    console.log(
      `[ApiService] ${options.method} request to ${endpoint} with body ${options.body}`
    );

    try {
      const response = await fetch(url, options);
      const statusCode = response.status;

      if (!response.ok) {
        const res = await response.json();
        return new ApiResponse(
          null,
          `${errorMessage}: ${res.error}`,
          statusCode
        );
      }

      const data = await response.json();
      console.log("[ApiService] API request successful, received data:", data);
      return new ApiResponse(data, null, statusCode);
    } catch (error) {
      console.error(`[ApiService] ${errorMessage}:`, error);
      return new ApiResponse(null, `${error.message}`);
    }
  }

  // Create or join an engagement with the specified parameters
  async joinEngagement(
    displayName,
    engagementId,
    isVideoCapabilitySet = true,
    isScreenshareCapabilitySet = true
  ) {
    return await this.apiRequest(
      `${this.apiBaseUrl}/join`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName,
          engagementId,
          isVideoCapabilitySet,
          isScreenshareCapabilitySet,
        }),
      },
      "Failed to join engagement"
    );
  }

  // Find engagement by ID and optional participant ID
  async searchEngagement(engagementId, participantId) {
    // Build the query string directly
    const queryParams = new URLSearchParams();
    queryParams.append("engagementId", engagementId);
    queryParams.append("participantId", participantId);

    // Construct the full URL
    const requestUrl = `${this.apiBaseUrl}/search?${queryParams.toString()}`;

    return await this.apiRequest(
      requestUrl,
      {
        method: "GET",
      },
      "Failed to fetch engagement details"
    );
  }

  // Retrieve attendee details by engagement and attendee IDs
  async getAttendee(engagementId, attendeeId) {
    // Build the query string directly
    const queryParams = new URLSearchParams();
    queryParams.append("engagementId", engagementId);
    queryParams.append("attendeeId", attendeeId);

    // Construct the full URL
    const requestUrl = `${this.apiBaseUrl}/attendee?${queryParams.toString()}`;

    return await this.apiRequest(
      requestUrl,
      {
        method: "GET",
      },
      "Failed to fetch attendee information"
    );
  }
}

export const apiService = new ApiService();
