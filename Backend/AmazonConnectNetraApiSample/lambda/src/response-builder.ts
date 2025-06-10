//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

const responseHeaders = {
    "Access-Control-Allow-Origin": "*",
    'Content-Type': 'application/json',
    'Access-Control-Allow-Credentials' : true,
    'Access-Control-Allow-Headers':'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
};

export const buildSuccessfulResponse = (result) => {
    const response = {
        statusCode: 200,
        headers: responseHeaders,
        body: JSON.stringify(result)
    };
    console.log("RESPONSE" + JSON.stringify(response));
    return response;
}

export const buildFailedResponse = (err) => {
    const response = {
        statusCode: err.statusCode,
        headers: responseHeaders,
        body: JSON.stringify(err.message)
    };
    return response;
}
