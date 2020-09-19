import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import { Construct, SecretValue, Stack, StackProps } from "@aws-cdk/core";
import { CdkPipeline, SimpleSynthAction } from "@aws-cdk/pipelines";
import { CdkpipelinesDemoStage } from "./cdkpipelines-demo-stage";
// stack defines app pipeline

export class CdkpipelinesDemoPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const sourceArtifact = new codepipeline.Artifact();
    const cloudAssemblyArtifact = new codepipeline.Artifact();

    const pipeline = new CdkPipeline(this, "Pipeline", {
      pipelineName: "MyServicePipeline",
      cloudAssemblyArtifact,

      sourceAction: new codepipeline_actions.GitHubSourceAction({
        actionName: "Github",
        output: sourceArtifact,
        oauthToken: SecretValue.secretsManager("github-access-token"),
        owner: "alymaquiling",
        repo: "aws-cdk-pipeline",
      }),

      // how it will be built + synthsized
      synthAction: SimpleSynthAction.standardNpmSynth({
        sourceArtifact,
        cloudAssemblyArtifact,

        // build step to compile Typescript Lambda
        buildCommand: "npm run build",
      }),
    });

    pipeline.addApplicationStage(
      new CdkpipelinesDemoStage(this, "PreProd", {
        env: { account: "986128056609", region: "us-east-1" },
      })
    );

    pipeline.addApplicationStage(
      new CdkpipelinesDemoStage(this, "Prod", {
        env: {
          account: "986128056609",
          region: "us-east-2",
        },
      })
    );
  }
}
