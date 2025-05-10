import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3"
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { DBStack } from "./DBstack"; // Import DBStack
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import { MyCdkStack } from "./my-cdk-app-stacks";

export class APIStack extends cdk.Stack {
  public readonly rawBucket: s3.Bucket;
  public readonly processedBucket: s3.Bucket;
  public readonly dynamoTable: string;
  public readonly uploadobjBucket: s3.Bucket;
  public readonly TransactionUploadsBucket: s3.Bucket;
  /* constructor(
    scope: cdk.App, id: string,dbStack: DBStack,processedBucket: s3.Bucket,dynamoTable: string, 
    TransactionUploadsBucket:s3.Bucket,uploadobjBucket:s3.Bucket, props?: cdk.StackProps,
  
  ) */ constructor(
  scope: cdk.App,
  id: string,
  dbStack: DBStack,
  processedBucket: s3.Bucket,
  dynamoTable: string,
  uploadobjBucket: s3.Bucket,
  props?: cdk.StackProps
){
    super(scope, id, props);

            /* const uploadBucket = TransactionUploadsBucket;
            const GetUploadUrlLambda = new lambda.Function(this, "GetUploadUrlLambda", {
                runtime: lambda.Runtime.NODEJS_18_X,
                handler: "getUploadUrl.handler",
                code: lambda.Code.fromAsset("lambda"),
                environment: {
                BUCKET_NAME: uploadBucket.bucketName,
                },
            });
            
            // Give Lambda permission to upload to S3
            uploadBucket.grantPut(GetUploadUrlLambda); */


    // Lambda function to insert sample cases into DynamoDB
    const insertSampleCaseLambda = new lambda.Function(this, "InsertSampleCaseLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "insertSampleCase.handler",  // Ensure this points to the correct handler
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        CASES_TABLE_NAME: dbStack.casesTable.tableName, // Pass table name as environment variable
      },
    });

    // Lambda function to insert new case into DynamoDB
    const insertCaseLambda = new lambda.Function(this, "InsertCaseLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "insertCase.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        CASES_TABLE_NAME: dbStack.casesTable.tableName,
      },
    });

    // Lambda function to get all cases from DynamoDB
    const getCasesLambda = new lambda.Function(this, "GetCasesLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "getCases.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        CASES_TABLE_NAME: dbStack.casesTable.tableName,
      },
    });

    // Lambda function for Hello World
    const helloLambda = new lambda.Function(this, "HelloLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda"),
    });
    // Lambda function for uploaidng objects to uploadbucket s3
    const uploadLambda = new lambda.Function(this, 'uploadLambda', {
          runtime: lambda.Runtime.NODEJS_18_X,
          handler: 'uploadobj.handler',
          code: lambda.Code.fromAsset("lambda"),
          environment: {
            BUCKET_NAME: uploadobjBucket.bucketName,
          },
        });
        // Grant permissions
    uploadobjBucket.grantPut(uploadLambda);

    // Lambda function to get upload history
    const uploadHistoryLambda = new lambda.Function(this, 'uploadHistoryLambda', {
    runtime: lambda.Runtime.NODEJS_18_X,
    handler: 'getUploadHistory.handler',
    code: lambda.Code.fromAsset("lambda"),
    environment: {
     BUCKET_NAME: uploadobjBucket.bucketName,
  },
  });
    uploadHistoryLambda.addEnvironment("UPLOAD_BUCKET", uploadobjBucket.bucketName);
    uploadobjBucket.grantRead(uploadHistoryLambda);
    /* uploadobjBucket.grant(uploadHistoryLambda, "s3:ListBucket"); */


    // Grant permissions for Lambda functions to interact with DynamoDB
    dbStack.casesTable.grantReadWriteData(insertCaseLambda);
    dbStack.casesTable.grantReadData(getCasesLambda);
    dbStack.casesTable.grantReadWriteData(insertSampleCaseLambda);

    

    // Create the API Gateway
    const api = new apigateway.RestApi(this, "[SenseAI]Api", {
      restApiName: " SensAI Service",
      description: "This is the existing API"

    });

        const uploadobj = api.root.addResource("uploadobj");
              uploadobj.addMethod("GET", new apigateway.LambdaIntegration(uploadLambda), { //for testing
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
                        
                        uploadobj.addCorsPreflight({
                          allowOrigins: ["http://localhost:3000"], // or ["https://d10uresn4y47do.cloudfront.net"] for production
                          allowMethods: ["GET","OPTIONS"],
                          
                        });
 
                  // Adding POST method
                  uploadobj.addMethod("POST", new apigateway.LambdaIntegration(uploadLambda), {
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




        const uploadhistory = api.root.addResource('uploadhistory');
        uploadhistory.addMethod('GET',new apigateway.LambdaIntegration(uploadHistoryLambda), { //for testing
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

        uploadhistory.addCorsPreflight({
          allowOrigins: ["http://localhost:3000"],
          allowMethods: ["GET","OPTIONS"],
        });
        

        /* const processedBucketName = cdk.Fn.importValue('ProcessedBucketName'); */
    // Lambda: TriggerPreprocessingLambda
        const triggerPreprocessingLambda = new lambda.Function(this, "TriggerPreprocessingLambda", {
          runtime: lambda.Runtime.NODEJS_18_X,
          handler: "triggerPreprocessingJob.handler",
          code: lambda.Code.fromAsset("lambda"),
          environment: {
            SAGEMAKER_ROLE_ARN: "arn:aws:iam::123456789012:role/SageMakerExecutionRole",
            IMAGE_URI: "123456789012.dkr.ecr.us-east-1.amazonaws.com/my-preprocessing-image:latest",
            INPUT_S3_URI: uploadobjBucket.bucketName,
            OUTPUT_S3_URI: `s3://${processedBucket.bucketName}/prefinal-output/`, // updated path
          },
        });
    
        // Allow Trigger Lambda to create SageMaker jobs
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
    
        // POST Method: Trigger the Preprocessing Job
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
            INPUT_PREFIX: "prefinal-output/",            // Read from this folder
            OUTPUT_BUCKET: processedBucket.bucketName,   // Still the same bucket
            OUTPUT_PREFIX: "final-processed/",           // Write to this folder
            DYNAMODB_TABLE_NAME: dynamoTable,            // DynamoDB table name
          },
        });
    
        // Allow Lambda to access both read & write in processed bucket
        processedBucket.grantReadWrite(processedDataStoringLambda);
    
        // Grant permission to write to DynamoDB table
        processedDataStoringLambda.addToRolePolicy(
          new iam.PolicyStatement({
            actions: ["dynamodb:PutItem"],
            resources: [`arn:aws:dynamodb:us-east-1:123456789012:table/${dynamoTable}`],
          })
        );
    
    
        // GET Method: Store the Processed Data
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
    
        // CORS Preflight for both method
        preProcessing.addCorsPreflight({
        allowOrigins: ["http://localhost:3000"], // Allow from all origins or specify your frontend domain
        allowMethods: ["GET", "OPTIONS","POST"],
        });
    

    /* // Resource for '/cases' to insert new case
    const cases = api.root.addResource("cases");
    cases.addMethod("POST", new apigateway.LambdaIntegration(insertCaseLambda)); // POST /cases
    cases.addMethod("GET", new apigateway.LambdaIntegration(getCasesLambda));   // GET /cases

    // Resource for '/cases/sample' to insert sample cases
    const sampleCases = cases.addResource("sample");
    sampleCases.addMethod("POST", new apigateway.LambdaIntegration(insertSampleCaseLambda));*/  // POST /cases/sample

    // Resource for '/hello'
    const hello = api.root.addResource("hello");
    hello.addMethod("GET", new apigateway.LambdaIntegration(helloLambda));  // GET /hello 

    // Outputs for both APIs
    new cdk.CfnOutput(this, "ApiEndpoint", {
      value: api.url,  // Combined API URL
    });
  }
}
