import * as cdk from "aws-cdk-lib";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { RemovalPolicy } from "aws-cdk-lib";
import { Construct } from 'constructs';
import * as glue from 'aws-cdk-lib/aws-glue';
import * as s3assets from 'aws-cdk-lib/aws-s3-assets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda';


export class MyCdkStack extends cdk.Stack {
  public readonly TransactionUploadsBucket: s3.Bucket;
  public readonly uploadobjBucket: s3.Bucket; // i will check if it nescceary or not

  constructor(scope: cdk.App, id: string, TransRawTable2: dynamodb.Table,props?: cdk.StackProps) {
    super(scope, id, props);




     // S3 Bucket for uploading obj in bucket
    this.uploadobjBucket = new s3.Bucket(this, 'uploadobjBucket', {
    
          removalPolicy: cdk.RemovalPolicy.DESTROY,
          autoDeleteObjects: true,
          cors: [{
            allowedOrigins: ['http://localhost:3000'], // Or use your CloudFront URL
            allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.GET, s3.HttpMethods.HEAD,s3.HttpMethods.POST],
            allowedHeaders: ['*'],
          }],
        });

    //lambda function tp parse the uploaded file and insert it into Dynamo
    const parseAndInsertLambda = new lambda.Function(this, 'parseAndInsertLambda', {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'parseAndInsert.handler',
        timeout: cdk.Duration.seconds(30), // ✅ Increase to 30 seconds
        memorySize: 256, // (optional) Give more memory for faster processing
        code: lambda.Code.fromAsset('lambda'), // folder with parseAndInsertLambda.js
        environment: {
          TABLE_NAME: TransRawTable2.tableName,
        },
      });

      // 🔐 Grant S3 read permission
      this.uploadobjBucket.grantRead(parseAndInsertLambda);

      // 🔐 Grant DynamoDB write permission
      TransRawTable2.grantWriteData(parseAndInsertLambda);

      // 📩 Add S3 event trigger
      this.uploadobjBucket.addEventNotification(
        s3.EventType.OBJECT_CREATED_PUT,
        new s3n.LambdaDestination(parseAndInsertLambda)
      );
      // 📩 Add S3 event trigger
      this.uploadobjBucket.addEventNotification(
        s3.EventType.OBJECT_CREATED_POST,
        new s3n.LambdaDestination(parseAndInsertLambda)
      );
        
    // S3 Bucket for React Website (without public access)
    this.TransactionUploadsBucket = new s3.Bucket(this, "TransactionUploadsBucket ", {
      
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "error.html",
      versioned: true,
      removalPolicy: RemovalPolicy.DESTROY,
     /*  publicReadAccess: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
          }), */
      
      cors: [
        {
          allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.GET, s3.HttpMethods.HEAD],
          allowedOrigins: ["https://d10uresn4y47do.cloudfront.net"], // Change to your actual domain in production
          allowedHeaders: ["*"],
        },
      ],
    });


    

    // Deploy React App to S3
    new s3deploy.BucketDeployment(this, "DeployWebsite", {
      sources: [s3deploy.Source.asset("frontend/build")],
      destinationBucket: this.TransactionUploadsBucket,
    });

    // CloudFront Distribution for S3 bucket
    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, "CloudFrontOAI");

    this.TransactionUploadsBucket.grantRead(cloudfrontOAI); // Grant CloudFront access to the S3 bucket

    const cloudfrontDistribution = new cloudfront.CloudFrontWebDistribution(this, "CloudFrontDistribution", {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: this.TransactionUploadsBucket,
            originAccessIdentity: cloudfrontOAI,  // Associate OAI with the CloudFront distribution
          },
          behaviors: [{ isDefaultBehavior: true }],
        },
      ],
      
    });

    // Output the CloudFront URL for the website
    new cdk.CfnOutput(this, "CloudFrontURL", {
      value: cloudfrontDistribution.distributionDomainName,
      description: "The URL of the CloudFront distribution for the website",
    });
new cdk.CfnOutput(this, "TransactionUploadsBucket", {
  value: this.TransactionUploadsBucket.bucketArn,
  exportName: "TransactionUploadsBucket"
});

    // 🔷 GLUE JOB SETUP --------------------

const glueJobName = 's3-to-dynamo-job';

// IAM role for Glue job
const glueRole = new iam.Role(this, 'GlueJobRole', {
  assumedBy: new iam.ServicePrincipal('glue.amazonaws.com'),
  managedPolicies: [
    iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole'),
    iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'),
    iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
  ],
});

// Upload the Glue script (Python file)
const glueScript = new s3assets.Asset(this, 'GlueScript', {
  path: 'lambda/s3-to-dynamo.py',
});

// Define the Glue Job
new glue.CfnJob(this, 'GlueJob', {
  name: glueJobName,
  role: glueRole.roleArn,
  command: {
    name: 'glueetl',
    scriptLocation: `s3://${glueScript.s3BucketName}/${glueScript.s3ObjectKey}`,
    pythonVersion: '3',
  },
  defaultArguments: {
    "--JOB_NAME": glueJobName,
    "--S3_PATH": `s3://${this.uploadobjBucket.bucketName}/`, // 🧠 read from this bucket dynamically
    "--DDB_TABLE": TransRawTable2.tableName                   
  },
  glueVersion: '4.0',
  numberOfWorkers: 2,
  workerType: 'G.1X',
});

// 🔷 LAMBDA TRIGGER SETUP --------------------

const glueTriggerRole = new iam.Role(this, 'GlueTriggerLambdaRole', {
  assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
  managedPolicies: [
    iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
    iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'),
    iam.ManagedPolicy.fromAwsManagedPolicyName('AWSGlueConsoleFullAccess'),
  ],
});

const glueTriggerLambda = new lambda.Function(this, 'GlueTriggerLambda', {
  runtime: lambda.Runtime.PYTHON_3_9,
  handler: 'glueTrigger.handler',
  code: lambda.Code.fromAsset('lambda'), // folder should contain glueTrigger.py
  environment: {
    GLUE_JOB_NAME: glueJobName,
  },
  role: glueTriggerRole,
});

// 🔷 S3 Trigger for Excel uploads --------------------

this.uploadobjBucket.addEventNotification(
  s3.EventType.OBJECT_CREATED,
  new s3n.LambdaDestination(glueTriggerLambda),
  { suffix: '.xlsx' }
);

    
  }
}

