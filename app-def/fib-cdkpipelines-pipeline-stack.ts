import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import { Construct, SecretValue, Stack, StackProps } from "@aws-cdk/core";
import { CdkPipeline, SimpleSynthAction } from "@aws-cdk/pipelines";
import { FibCdkpipelinesStage } from "./fib-cdkpipelines-stage";
import { ShellScriptAction } from "@aws-cdk/pipelines";
// stack defines app pipeline

export class FibCdkpipelinesPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const path = require('path')
    require('dotenv').config({
      path: path.resolve(__dirname,"../.env")
    })

    const preProdEnv = {
      account: process.env.AWS_ACCOUNT_PREPROD!,
      region: process.env.AWS_REGION_PREPROD!
    }

    const prodEnv = {
      account: process.env.AWS_ACCOUNT_PROD!,
      region: process.env.AWS_REGION_PROD!
    }

    const sourceArtifact = new codepipeline.Artifact();
    const cloudAssemblyArtifact = new codepipeline.Artifact();

    const pipeline = new CdkPipeline(this, "Pipeline", {
      pipelineName: "MyServicePipeline",
      cloudAssemblyArtifact,

      sourceAction: new codepipeline_actions.GitHubSourceAction({
        actionName: "Github",
        output: sourceArtifact,
        oauthToken: SecretValue.secretsManager(process.env.SECRETSMANAGER_GITHUB_TOKEN!),
        owner: process.env.GITHUB_USERNAME!,
        repo: process.env.GITHUB_REPO!
      }),

      // how it will be built + synthsized
      synthAction: new SimpleSynthAction({
        sourceArtifact,
        cloudAssemblyArtifact,
        synthCommand: "cdk synth",
        buildCommands: []
      }),
    });

    const preprod = new FibCdkpipelinesStage(this, "PreProd", {
      env: preProdEnv,
    });

    const preprodStage = pipeline.addApplicationStage(preprod);
    preprodStage.addActions(
      new ShellScriptAction({
        actionName: "TestService",
        useOutputs: {
          // stack output from stage,
          // make available in shell script
          // as $ENDPOINT_URL
          ENDPOINT_URL: pipeline.stackOutput(preprod.urlOutput),
        },
        commands: [
          // use curl to get the full url
          // fail if returns error
          "curl -Ssf $ENDPOINT_URL",
        ],
      })
    );
    pipeline.addApplicationStage(
      new FibCdkpipelinesStage(this, "Prod", {
        env: prodEnv,
      })
    );
  }
}
