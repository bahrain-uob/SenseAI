// Import required CDK and AWS libraries
import * as cdk from 'aws-cdk-lib'; // core AWS CDK functionality
import { Construct } from 'constructs'; // base class for defining AWS components
import * as lambda from 'aws-cdk-lib/aws-lambda'; // to define Lambda functions
import * as s3 from 'aws-cdk-lib/aws-s3'; // to create and manage S3 buckets
import * as apigateway from 'aws-cdk-lib/aws-apigateway'; // to create REST APIs

// Define a new CDK stack called ReplaceStack
export class ReplaceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Step 1: Create a new S3 bucket where files will be uploaded or replaced
    const uploadBucket = new s3.Bucket(this, 'UploadBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY, // deletes the bucket when stack is destroyed (for dev only)
      autoDeleteObjects: true // allows CDK to delete files inside before destroying bucket
    });

    // Step 2: Create a Lambda function to handle the "replace" logic
    const replaceLambda = new lambda.Function(this, 'ReplaceFunction', {
        runtime: lambda.Runtime.NODEJS_18_X,
        // Choose Node.js as the runtime
      handler: 'index.handler', // The entry point inside the Lambda file (index.js)
      code: lambda.Code.fromAsset('lambda/replace'), // Folder path where your Lambda code is located
      environment: {
        BUCKET_NAME: uploadBucket.bucketName // Pass the bucket name as an environment variable to Lambda
      }
    });

    // Step 3: Give Lambda permission to read and write to the S3 bucket
    uploadBucket.grantReadWrite(replaceLambda);

    // Step 4: Create a new REST API Gateway to expose the Lambda function as an endpoint
    const api = new apigateway.RestApi(this, 'ReplaceApi');

    // Step 5: Link the POST /replace endpoint to the Lambda function
    const replaceIntegration = new apigateway.LambdaIntegration(replaceLambda);
    api.root.addResource('replace').addMethod('POST', replaceIntegration);
  }
}
