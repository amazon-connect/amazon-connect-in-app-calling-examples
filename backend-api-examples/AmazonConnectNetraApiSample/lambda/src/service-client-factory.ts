//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0

import * as AWS from '@aws-sdk/client-connect';
import { ConnectParticipantClient } from '@aws-sdk/client-connectparticipant';

export const createConnectClient = () => {
  const connectProps = process.env.CONNECT_ENDPOINT ? {
    region: process.env.REGION!,
    endpoint: process.env.CONNECT_ENDPOINT
  } : {
    region: process.env.REGION!
  };
  return new AWS.Connect(connectProps);
};

export const createConnectParticipantClient = () => {
    const credentials = {
      accessKeyId: '',
      secretAccessKey: ''
    }
    const clientProps = process.env.CONNECT_PARTICIPANT_ENDPOINT ? {
      region: process.env.REGION!,
      endpoint: process.env.CONNECT_PARTICIPANT_ENDPOINT!,
      credentials: credentials
    } : {
      region: process.env.REGION!,
      credentials: credentials
    };

    return new ConnectParticipantClient(clientProps);
}