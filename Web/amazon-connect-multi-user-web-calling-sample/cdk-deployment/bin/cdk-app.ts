#!/usr/bin/env node
/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { MultipartySampleStack } from "../lib/multiparty-sample-stack";
import { STACK_NAME } from "../lib/constants";

const app = new cdk.App();
new MultipartySampleStack(app, STACK_NAME, {});
