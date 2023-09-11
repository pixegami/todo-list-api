import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ddb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";

export class TodoInfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create DDB table to store the tasks.
    const table = new ddb.Table(this, "Tasks", {
      partitionKey: { name: "task_id", type: ddb.AttributeType.STRING },
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: "ttl",
    });

    // Add GSI based on user_id.
    table.addGlobalSecondaryIndex({
      indexName: "user-index",
      partitionKey: { name: "user_id", type: ddb.AttributeType.STRING },
      sortKey: { name: "created_time", type: ddb.AttributeType.NUMBER },
    });

    // Create an S3 bucket to host static website
    const websiteBucket = new s3.Bucket(this, "TodoSiteBucket", {
      websiteIndexDocument: "index.html",
      removalPolicy: RemovalPolicy.DESTROY,
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
    });

    // Create Lambda function for the API.
    const api = new lambda.Function(this, "API", {
      // https://docs.aws.amazon.com/cdk/api/v1/docs/aws-lambda-readme.html#bundling-asset-code
      code: lambda.Code.fromAsset("../api", {
        bundling: {
          image: lambda.Runtime.PYTHON_3_9.bundlingImage,
          command: [
            "bash",
            "-c",
            "pip install -r requirements.txt -t /asset-output && cp -au . /asset-output",
          ],
        },
      }),
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: "todo.handler",
      architecture: lambda.Architecture.ARM_64,
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    table.grantReadWriteData(api);

    // Create a URL so we can access the function.
    const functionUrl = api.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ["*"],
        allowedMethods: [lambda.HttpMethod.ALL],
        allowedHeaders: ["*"],
      },
    });

    // Deploy site contents to S3 bucket
    new s3deploy.BucketDeployment(this, "DeployTodoSite", {
      sources: [s3deploy.Source.asset("../todo-site/out")],
      destinationBucket: websiteBucket,
    });

    // Output the website URL
    new CfnOutput(this, "TodoSiteURL", {
      value: websiteBucket.bucketWebsiteUrl,
    });

    // Output the API function url.
    new CfnOutput(this, "APIUrl", {
      value: functionUrl.url,
    });
  }
}
