#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';

const app = new cdk.App();
const stackName = 'AmazonConnectInAppCallingApiSample';

new CdkStack(app, stackName);
