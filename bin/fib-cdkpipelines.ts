#!/usr/bin/env node
import { App } from "@aws-cdk/core";
import { FibCdkpipelinesPipelineStack } from "../app-def/fib-cdkpipelines-pipeline-stack";
import { FibCdkpipelinesStage } from "../app-def/fib-cdkpipelines-stage";


const app = new App();

new FibCdkpipelinesPipelineStack(app, "FibCdkpipelinesPipelineStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

new FibCdkpipelinesStage(app, "Dev", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

app.synth();
