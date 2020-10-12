import { CfnOutput, Construct, Stage, StageProps } from "@aws-cdk/core";
import { FibCdkpipelinesStack } from "./fib-cdkpipelines-stack";

// Deployable unit of web service app

export class FibCdkpipelinesStage extends Stage {
  public readonly urlOutput: CfnOutput;

  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    const service = new FibCdkpipelinesStack(this, "WebService");

    // expose CdkpipelinesDemoStack's output one level higher
    this.urlOutput = service.urlOutput;
  }
}
