import * as cdk from "aws-cdk-lib";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import { RemovalPolicy } from "aws-cdk-lib";

export class MyCdkStack extends cdk.Stack {
  public readonly TransactionUploadsBucket: s3.Bucket;
  public readonly uploadobjBucket: s3.Bucket; // i will check if it nescceary or not

  constructor(scope: cdk.App, id: string, TransRawTable: dynamodb.Table,TransRawTable2: dynamodb.Table,props?: cdk.StackProps) {
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
        timeout: cdk.Duration.minutes(5), // ✅ Increase to 30 seconds
        memorySize: 4096, // (optional) Give more memory for faster processing
        code: lambda.Code.fromAsset('lambda'), // folder with parseAndInsertLambda.js
        environment: {
           RAW_TABLE: TransRawTable.tableName,        // original
           RAW_V2_TABLE: TransRawTable2.tableName,
        },
      });
       // ← INLINE POLICY: allow writes to your DynamoDB table Orignal*********
    parseAndInsertLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'dynamodb:BatchWriteItem',
        'dynamodb:PutItem',
      ],
      resources: [
        `arn:aws:dynamodb:${this.region}:${this.account}:table/${TransRawTable2.tableName}`
      ],
    }));

      // 🔐 Grant S3 read permission
      this.uploadobjBucket.grantRead(parseAndInsertLambda);

      // 🔐 Grant DynamoDB write permission
      TransRawTable2.grantWriteData(parseAndInsertLambda);
      TransRawTable.grantWriteData(parseAndInsertLambda);



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
    
  }
}

