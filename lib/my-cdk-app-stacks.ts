import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import { RemovalPolicy } from "aws-cdk-lib";

export class MyCdkStack extends cdk.Stack {
  public readonly TransactionUploadsBucket: s3.Bucket;
  public readonly uploadobjBucket: s3.Bucket;
  public readonly processedBucket: s3.Bucket; // i will check if it nescceary or not

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);




     // S3 Bucket for uploading obj in bucket
    this.uploadobjBucket = new s3.Bucket(this, 'uploadobjBucket', {
          removalPolicy: cdk.RemovalPolicy.DESTROY,
          autoDeleteObjects: true,
          cors: [{
            allowedOrigins: ['*'], // Or use your CloudFront URL
            allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.GET, s3.HttpMethods.HEAD,s3.HttpMethods.POST],
            allowedHeaders: ['*'],
          }],
        });

        /* new cdk.CfnOutput(this, 'uploadObjBucketArnOutput', {
          value: this.uploadobjBucket.bucketName,
          exportName: 'uploadObjBucketName',
        }); */
        
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
          allowedOrigins: ["*"], // Change to your actual domain in production
          allowedHeaders: ["*"],
        },
      ],
    });




    // Processed bucket for output data
    this.processedBucket = new s3.Bucket(this, "ProcessedBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [{
        allowedOrigins: ['*'], // Or use your CloudFront URL
        allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.GET, s3.HttpMethods.HEAD,s3.HttpMethods.POST],
        allowedHeaders: ['*'],
      }],
    });
    new cdk.CfnOutput(this, 'ProcessedBucketNameExport', {
      value: this.processedBucket.bucketName,
      exportName: 'ProcessedBucketName',
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

