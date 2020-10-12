#!/usr/bin/env node
import { App } from "@aws-cdk/core";
import { FibCdkpipelinesPipelineStack } from "./fib-cdkpipelines-pipeline-stack";
import { FibCdkpipelinesStage } from "./fib-cdkpipelines-stage";

const app = new App();

const path = require('path')
    require('dotenv').config({
      path: path.resolve(__dirname,"../.env")
    })

new FibCdkpipelinesPipelineStack(app, "FibCdkpipelinesStage", {
  env: { account: process.env.AWS_ACCOUNT_PREPROD!, region: process.env.AWS_ACCOUNT_PREPROD! },
});

new FibCdkpipelinesStage(app, "Dev", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

app.synth();
