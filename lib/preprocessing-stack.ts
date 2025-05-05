import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';

export class PreprocessingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Processed bucket
    const processedBucket = new s3.Bucket(this, "ProcessedBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [{
        allowedOrigins: ["*"],
        allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.GET, s3.HttpMethods.HEAD, s3.HttpMethods.POST],
        allowedHeaders: ["*"],
      }],
    });

    // Upload (raw input) bucket
    const uploadobjBucket = new s3.Bucket(this, "UploadObjBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'SenseAI-API', {
      restApiName: 'SenseAI Service',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // Lambda: TriggerPreprocessingLambda
    const triggerPreprocessingLambda = new lambda.Function(this, "TriggerPreprocessingLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("lambda"),
       handler: "triggerPreprocessingJob.handler",
      environment: {
        SAGEMAKER_ROLE_ARN: "arn:aws:iam::123456789012:role/SageMakerExecutionRole",
        IMAGE_URI: "123456789012.dkr.ecr.us-east-1.amazonaws.com/my-preprocessing-image:latest",
        INPUT_S3_URI: uploadobjBucket.bucketName,
        OUTPUT_S3_URI: `s3://${processedBucket.bucketName}/prefinal-output/`,
      },
    });

    triggerPreprocessingLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["sagemaker:CreateProcessingJob"],
        resources: ["*"],
      })
    );

    // Trigger the Lambda when a new object is created in raw bucket
    uploadobjBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(triggerPreprocessingLambda)
    );

    const preProcessing = api.root.addResource("pre-processing");

    preProcessing.addMethod("POST", new apigateway.LambdaIntegration(triggerPreprocessingLambda), {
      authorizationType: apigateway.AuthorizationType.NONE,
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
            "method.response.header.Access-Control-Allow-Headers": true,
            "method.response.header.Access-Control-Allow-Methods": true,
          },
        },
      ],
    });

    // Lambda: ProcessedDataStoringLambda
    const processedDataStoringLambda = new lambda.Function(this, "ProcessedDataStoringLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "processedDataStoring.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        INPUT_PREFIX: "prefinal-output/",
        OUTPUT_BUCKET: processedBucket.bucketName,
        OUTPUT_PREFIX: "final-processed/",
        DYNAMODB_TABLE_NAME: "YourDynamoTableName", // Replace with actual table name
      },
    });

    processedBucket.grantReadWrite(processedDataStoringLambda);

    processedDataStoringLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["dynamodb:PutItem"],
        resources: ["arn:aws:dynamodb:us-east-1:123456789012:table/YourDynamoTableName"], // Replace with actual
      })
    );

    // GET: read processed data
    preProcessing.addMethod("GET", new apigateway.LambdaIntegration(processedDataStoringLambda), {
      authorizationType: apigateway.AuthorizationType.NONE,
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
            "method.response.header.Access-Control-Allow-Headers": true,
            "method.response.header.Access-Control-Allow-Methods": true,
          },
        },
      ],
    });

    // Do NOT add addCorsPreflight() here again – it causes duplicate OPTIONS error
  }
}

