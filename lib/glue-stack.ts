import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as glue from 'aws-cdk-lib/aws-glue';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3assets from 'aws-cdk-lib/aws-s3-assets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';

interface GlueStackProps extends cdk.StackProps {
  ingestBucket: s3.Bucket;
  dynamoTable: dynamodb.Table;
}

export class GlueStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: GlueStackProps) {
    super(scope, id, props);

    const glueJobName = 's3-to-dynamo-job';

    // Glue Job Role
    const glueRole = new iam.Role(this, 'GlueJobRole', {
      assumedBy: new iam.ServicePrincipal('glue.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
      ],
    });

    // Glue Script Asset
    const glueScript = new s3assets.Asset(this, 'GlueScript', {
      path: 'lambda/s3-to-dynamo.py',
    });

    // Glue Job
    new glue.CfnJob(this, 'GlueJob', {
      name: glueJobName,
      role: glueRole.roleArn,
      command: {
        name: 'glueetl',
        scriptLocation: `s3://${glueScript.s3BucketName}/${glueScript.s3ObjectKey}`,
        pythonVersion: '3'
      },
      defaultArguments: {
        "--JOB_NAME": glueJobName,
        "--S3_PATH": `s3://${props.ingestBucket.bucketName}/`
      },
      glueVersion: '4.0',
      numberOfWorkers: 2,
      workerType: 'G.1X'
    });

    // Lambda Role
    const lambdaRole = new iam.Role(this, 'GlueTriggerLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AWSGlueConsoleFullAccess') // Can be restricted
      ]
    });

    // Lambda Function to trigger Glue
    const glueTriggerLambda = new lambdaNode.Function(this, 'GlueTriggerLambda', {
      runtime: lambdaNode.Runtime.PYTHON_3_9,
      handler: 'glueTrigger.handler',
      code: lambdaNode.Code.fromAsset('lambda'), // Make sure glueTrigger.py is inside /lambda/
      environment: {
        GLUE_JOB_NAME: glueJobName,
      },
      role: lambdaRole,
    });

    // S3 Event Notification for new .json uploads
    props.ingestBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(glueTriggerLambda),
      { suffix: '.xlsx' }
    );
  }
}
