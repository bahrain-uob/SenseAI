import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3"
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import { DBStack } from "./DBstack"; // Import DBStack

import { MyCdkStack } from "./my-cdk-app-stack";





export class APIStack extends cdk.Stack {
  public readonly TransactionUploadsBucket: s3.Bucket;
  constructor(scope: cdk.App, id: string, dbStack: DBStack,TransactionUploadsBucket:s3.Bucket,uploadobjBucket:s3.Bucket, props?: cdk.StackProps,) {
    super(scope, id, props);

            const uploadBucket = TransactionUploadsBucket;
            const GetUploadUrlLambda = new lambda.Function(this, "GetUploadUrlLambda", {
                runtime: lambda.Runtime.NODEJS_18_X,
                handler: "getUploadUrl.handler",
                code: lambda.Code.fromAsset("lambda"),
                environment: {
                BUCKET_NAME: uploadBucket.bucketName,
                },
            });
            
            // Give Lambda permission to upload to S3
            uploadBucket.grantPut(GetUploadUrlLambda);

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

    /* //lambda function tp parse the uploaded file and insert it into Dynamo
    const parseAndInsertLambda = new lambda.Function(this, 'parseAndInsertLambda', {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'parseAndInsert.handler',
        code: lambda.Code.fromAsset('lambda'), // folder with parseAndInsertLambda.js
        environment: {
          TABLE_NAME: dbStack.rawTransTable.tableName,
        },
      });

      // 🔐 Grant S3 read permission
      uploadobjBucket.grantRead(parseAndInsertLambda);

      // 🔐 Grant DynamoDB write permission
      dbStack.rawTransTable.grantWriteData(parseAndInsertLambda);

      // 📩 Add S3 event trigger
      uploadobjBucket.addEventNotification(
        s3.EventType.OBJECT_CREATED,
        new s3n.LambdaDestination(parseAndInsertLambda)
      ); */



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
    });
    //upload api path to upload transaction
    const upload = api.root.addResource("upload");
    upload.addMethod("GET", new apigateway.LambdaIntegration(GetUploadUrlLambda), { //for testing
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
              
              upload.addCorsPreflight({
                allowOrigins: ["http://localhost:3000"], // or ["https://d10uresn4y47do.cloudfront.net"] for production
                allowMethods: ["GET","PUT"],
                
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

        
//Bedrock endpoint configuration for the chatbot 
        const chatBedrockLambda = new lambda.Function(this, "ChatBedrockLambda", {
          runtime: lambda.Runtime.PYTHON_3_11,
          handler: "chatbedrock.handler", // Path: lambda/chatbedrock.py
          code: lambda.Code.fromAsset("lambda"),
          environment: {
            KNOWLEDGE_BASE_ID: "FAIIYRNX5D",  // ← Replace this
          },
        });
        chatBedrockLambda.addToRolePolicy(new iam.PolicyStatement({
          actions: ["bedrock:RetrieveAndGenerate"],
          resources: ["*"]
        }));

        const chatbedrock = api.root.addResource("chatbedrock");
        chatbedrock.addMethod("POST", new apigateway.LambdaIntegration(chatBedrockLambda), {
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
        chatbedrock.addCorsPreflight({
          allowOrigins: [
            "http://localhost:3000", // Local dev
            "https://d10uresn4y47do.cloudfront.net" // Production
          ],
          allowMethods: ["POST", "OPTIONS"],
          allowHeaders: ["Content-Type"]
        });
        
//Employee activities integration        
        // Lambda to retrieve employee activity logs
        const getEmployeeActivitiesLambda = new lambda.Function(this, "GetEmployeeActivitiesLambda", {
          runtime: lambda.Runtime.PYTHON_3_11,
          handler: "getEmployeeActivities.handler",
          code: lambda.Code.fromAsset("lambda"),
          environment: {
            ACTIVITY_TABLE_NAME: dbStack.activityTable.tableName,
          },
        });

        // Grant read permissions to the table
        dbStack.activityTable.grantReadData(getEmployeeActivitiesLambda);

        // API Gateway resource
        const activities = api.root.addResource("employee-activities");
        activities.addMethod("GET", new apigateway.LambdaIntegration(getEmployeeActivitiesLambda), {
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

        activities.addCorsPreflight({
          allowOrigins: ["http://localhost:3000"],
          allowMethods: ["GET", "OPTIONS"],
        });

      // Lambda function for RawTrans
      const getFromTransRawLambda = new lambda.Function(this, 'GetFromTransRawLambda', {
        runtime: lambda.Runtime.PYTHON_3_11,
        handler: 'getFromTransRaw.handler',
        code: lambda.Code.fromAsset('lambda'),
        environment: {
          TABLE_NAME: dbStack.TransRawTable.tableName,
        },
      });

      // Grant Lambda read access to table
      dbStack.TransRawTable.grantReadData(getFromTransRawLambda);
      
      // API Gateway resource
        const rawtrans = api.root.addResource("RawTransaction");
        rawtrans.addMethod("GET", new apigateway.LambdaIntegration(getFromTransRawLambda), {
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

        rawtrans.addCorsPreflight({
          allowOrigins: ["http://localhost:3000"],
          allowMethods: ["GET", "OPTIONS"],
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
