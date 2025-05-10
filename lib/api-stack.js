"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIStack = void 0;
const cdk = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const s3 = require("aws-cdk-lib/aws-s3");
const apigateway = require("aws-cdk-lib/aws-apigateway");
const iam = require("aws-cdk-lib/aws-iam");
const s3n = require("aws-cdk-lib/aws-s3-notifications");
class APIStack extends cdk.Stack {
    /* constructor(
      scope: cdk.App, id: string,dbStack: DBStack,processedBucket: s3.Bucket,dynamoTable: string,
      TransactionUploadsBucket:s3.Bucket,uploadobjBucket:s3.Bucket, props?: cdk.StackProps,
    
    ) */ constructor(scope, id, dbStack, processedBucket, dynamoTable, uploadobjBucket, props) {
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
            handler: "insertSampleCase.handler", // Ensure this points to the correct handler
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
        uploadobj.addMethod("GET", new apigateway.LambdaIntegration(uploadLambda), {
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
            allowMethods: ["GET", "OPTIONS"],
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
        uploadhistory.addMethod('GET', new apigateway.LambdaIntegration(uploadHistoryLambda), {
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
            allowMethods: ["GET", "OPTIONS"],
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
        triggerPreprocessingLambda.addToRolePolicy(new iam.PolicyStatement({
            actions: ["sagemaker:CreateProcessingJob"],
            resources: ["*"],
        }));
        // Trigger the Lambda when a new object is created in raw bucket
        uploadobjBucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(triggerPreprocessingLambda));
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
                INPUT_PREFIX: "prefinal-output/", // Read from this folder
                OUTPUT_BUCKET: processedBucket.bucketName, // Still the same bucket
                OUTPUT_PREFIX: "final-processed/", // Write to this folder
                DYNAMODB_TABLE_NAME: dynamoTable, // DynamoDB table name
            },
        });
        // Allow Lambda to access both read & write in processed bucket
        processedBucket.grantReadWrite(processedDataStoringLambda);
        // Grant permission to write to DynamoDB table
        processedDataStoringLambda.addToRolePolicy(new iam.PolicyStatement({
            actions: ["dynamodb:PutItem"],
            resources: [`arn:aws:dynamodb:us-east-1:123456789012:table/${dynamoTable}`],
        }));
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
            allowMethods: ["GET", "OPTIONS", "POST"],
        });
        /* // Resource for '/cases' to insert new case
        const cases = api.root.addResource("cases");
        cases.addMethod("POST", new apigateway.LambdaIntegration(insertCaseLambda)); // POST /cases
        cases.addMethod("GET", new apigateway.LambdaIntegration(getCasesLambda));   // GET /cases
    
        // Resource for '/cases/sample' to insert sample cases
        const sampleCases = cases.addResource("sample");
        sampleCases.addMethod("POST", new apigateway.LambdaIntegration(insertSampleCaseLambda));*/ // POST /cases/sample
        // Resource for '/hello'
        const hello = api.root.addResource("hello");
        hello.addMethod("GET", new apigateway.LambdaIntegration(helloLambda)); // GET /hello 
        // Outputs for both APIs
        new cdk.CfnOutput(this, "ApiEndpoint", {
            value: api.url, // Combined API URL
        });
    }
}
exports.APIStack = APIStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBpLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUNuQyxpREFBaUQ7QUFDakQseUNBQXdDO0FBQ3hDLHlEQUF5RDtBQUV6RCwyQ0FBMkM7QUFDM0Msd0RBQXdEO0FBR3hELE1BQWEsUUFBUyxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBTXJDOzs7O1FBSUksQ0FBQyxZQUNMLEtBQWMsRUFDZCxFQUFVLEVBQ1YsT0FBZ0IsRUFDaEIsZUFBMEIsRUFDMUIsV0FBbUIsRUFDbkIsZUFBMEIsRUFDMUIsS0FBc0I7UUFFcEIsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFaEI7Ozs7Ozs7Ozs7O3FEQVc2QztRQUdyRCx1REFBdUQ7UUFDdkQsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLHdCQUF3QixFQUFFO1lBQ2pGLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsT0FBTyxFQUFFLDBCQUEwQixFQUFHLDRDQUE0QztZQUNsRixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO1lBQ3JDLFdBQVcsRUFBRTtnQkFDWCxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSwwQ0FBMEM7YUFDM0Y7U0FDRixDQUFDLENBQUM7UUFFSCxtREFBbUQ7UUFDbkQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQ3JFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsT0FBTyxFQUFFLG9CQUFvQjtZQUM3QixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO1lB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Q0FBdUM7UUFDdkMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxVQUFVLENBQUMsaUJBQWlCLENBQUMsMEJBQTBCLENBQUMsRUFBRTtZQUM3RixpQkFBaUIsRUFBRSxVQUFVLENBQUMsaUJBQWlCLENBQUMsSUFBSTtZQUNwRCxlQUFlLEVBQUU7Z0JBQ2I7b0JBQ0EsVUFBVSxFQUFFLEtBQUs7b0JBQ2pCLGtCQUFrQixFQUFFO3dCQUNoQixvREFBb0QsRUFBRSxJQUFJO3dCQUMxRCxxREFBcUQsRUFBRSxJQUFJO3dCQUMzRCxxREFBcUQsRUFBRSxJQUFJO3FCQUM5RDtpQkFDQTthQUNKO1NBQ0EsQ0FBQyxDQUFDO1FBRUgsaUNBQWlDO1FBQ2pDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQztZQUMvQixZQUFZLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLHlEQUF5RDtZQUNsRyxZQUFZLEVBQUUsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFDLE1BQU0sQ0FBQztTQUN0QyxDQUFDLENBQUM7UUFHUDs7Ozs7OztrR0FPMEYsQ0FBRSxxQkFBcUI7UUFFakgsd0JBQXdCO1FBQ3hCLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzVDLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksVUFBVSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBRSxjQUFjO1FBRXRGLHdCQUF3QjtRQUN4QixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUNyQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRyxtQkFBbUI7U0FDckMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBOVJELDRCQThSQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiYXdzLWNkay1saWJcIjtcclxuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtbGFtYmRhXCI7XHJcbmltcG9ydCAqIGFzIHMzIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtczNcIlxyXG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheVwiO1xyXG5pbXBvcnQgeyBEQlN0YWNrIH0gZnJvbSBcIi4vREJzdGFja1wiOyAvLyBJbXBvcnQgREJTdGFja1xyXG5pbXBvcnQgKiBhcyBpYW0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1pYW1cIjtcclxuaW1wb3J0ICogYXMgczNuIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtczMtbm90aWZpY2F0aW9uc1wiO1xyXG5pbXBvcnQgeyBNeUNka1N0YWNrIH0gZnJvbSBcIi4vbXktY2RrLWFwcC1zdGFja3NcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBBUElTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XHJcbiAgcHVibGljIHJlYWRvbmx5IHJhd0J1Y2tldDogczMuQnVja2V0O1xyXG4gIHB1YmxpYyByZWFkb25seSBwcm9jZXNzZWRCdWNrZXQ6IHMzLkJ1Y2tldDtcclxuICBwdWJsaWMgcmVhZG9ubHkgZHluYW1vVGFibGU6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgdXBsb2Fkb2JqQnVja2V0OiBzMy5CdWNrZXQ7XHJcbiAgcHVibGljIHJlYWRvbmx5IFRyYW5zYWN0aW9uVXBsb2Fkc0J1Y2tldDogczMuQnVja2V0O1xyXG4gIC8qIGNvbnN0cnVjdG9yKFxyXG4gICAgc2NvcGU6IGNkay5BcHAsIGlkOiBzdHJpbmcsZGJTdGFjazogREJTdGFjayxwcm9jZXNzZWRCdWNrZXQ6IHMzLkJ1Y2tldCxkeW5hbW9UYWJsZTogc3RyaW5nLCBcclxuICAgIFRyYW5zYWN0aW9uVXBsb2Fkc0J1Y2tldDpzMy5CdWNrZXQsdXBsb2Fkb2JqQnVja2V0OnMzLkJ1Y2tldCwgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcyxcclxuICBcclxuICApICovIGNvbnN0cnVjdG9yKFxyXG4gIHNjb3BlOiBjZGsuQXBwLFxyXG4gIGlkOiBzdHJpbmcsXHJcbiAgZGJTdGFjazogREJTdGFjayxcclxuICBwcm9jZXNzZWRCdWNrZXQ6IHMzLkJ1Y2tldCxcclxuICBkeW5hbW9UYWJsZTogc3RyaW5nLFxyXG4gIHVwbG9hZG9iakJ1Y2tldDogczMuQnVja2V0LFxyXG4gIHByb3BzPzogY2RrLlN0YWNrUHJvcHNcclxuKXtcclxuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xyXG5cclxuICAgICAgICAgICAgLyogY29uc3QgdXBsb2FkQnVja2V0ID0gVHJhbnNhY3Rpb25VcGxvYWRzQnVja2V0O1xyXG4gICAgICAgICAgICBjb25zdCBHZXRVcGxvYWRVcmxMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsIFwiR2V0VXBsb2FkVXJsTGFtYmRhXCIsIHtcclxuICAgICAgICAgICAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxyXG4gICAgICAgICAgICAgICAgaGFuZGxlcjogXCJnZXRVcGxvYWRVcmwuaGFuZGxlclwiLFxyXG4gICAgICAgICAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KFwibGFtYmRhXCIpLFxyXG4gICAgICAgICAgICAgICAgZW52aXJvbm1lbnQ6IHtcclxuICAgICAgICAgICAgICAgIEJVQ0tFVF9OQU1FOiB1cGxvYWRCdWNrZXQuYnVja2V0TmFtZSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gR2l2ZSBMYW1iZGEgcGVybWlzc2lvbiB0byB1cGxvYWQgdG8gUzNcclxuICAgICAgICAgICAgdXBsb2FkQnVja2V0LmdyYW50UHV0KEdldFVwbG9hZFVybExhbWJkYSk7ICovXHJcblxyXG5cclxuICAgIC8vIExhbWJkYSBmdW5jdGlvbiB0byBpbnNlcnQgc2FtcGxlIGNhc2VzIGludG8gRHluYW1vREJcclxuICAgIGNvbnN0IGluc2VydFNhbXBsZUNhc2VMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsIFwiSW5zZXJ0U2FtcGxlQ2FzZUxhbWJkYVwiLCB7XHJcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxyXG4gICAgICBoYW5kbGVyOiBcImluc2VydFNhbXBsZUNhc2UuaGFuZGxlclwiLCAgLy8gRW5zdXJlIHRoaXMgcG9pbnRzIHRvIHRoZSBjb3JyZWN0IGhhbmRsZXJcclxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KFwibGFtYmRhXCIpLFxyXG4gICAgICBlbnZpcm9ubWVudDoge1xyXG4gICAgICAgIENBU0VTX1RBQkxFX05BTUU6IGRiU3RhY2suY2FzZXNUYWJsZS50YWJsZU5hbWUsIC8vIFBhc3MgdGFibGUgbmFtZSBhcyBlbnZpcm9ubWVudCB2YXJpYWJsZVxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gTGFtYmRhIGZ1bmN0aW9uIHRvIGluc2VydCBuZXcgY2FzZSBpbnRvIER5bmFtb0RCXHJcbiAgICBjb25zdCBpbnNlcnRDYXNlTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCBcIkluc2VydENhc2VMYW1iZGFcIiwge1xyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcclxuICAgICAgaGFuZGxlcjogXCJpbnNlcnRDYXNlLmhhbmRsZXJcIixcclxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KFwibGFtYmRhXCIpLFxyXG4gICAgICBlbnZpcm9ubWVudDoge1xyXG4gICAgICAgIENBU0VTX1RBQkxFX05BTUU6IGRiU3RhY2suY2FzZXNUYWJsZS50YWJsZU5hbWUsXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBMYW1iZGEgZnVuY3Rpb24gdG8gZ2V0IGFsbCBjYXNlcyBmcm9tIER5bmFtb0RCXHJcbiAgICBjb25zdCBnZXRDYXNlc0xhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgXCJHZXRDYXNlc0xhbWJkYVwiLCB7XHJcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxyXG4gICAgICBoYW5kbGVyOiBcImdldENhc2VzLmhhbmRsZXJcIixcclxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KFwibGFtYmRhXCIpLFxyXG4gICAgICBlbnZpcm9ubWVudDoge1xyXG4gICAgICAgIENBU0VTX1RBQkxFX05BTUU6IGRiU3RhY2suY2FzZXNUYWJsZS50YWJsZU5hbWUsXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBMYW1iZGEgZnVuY3Rpb24gZm9yIEhlbGxvIFdvcmxkXHJcbiAgICBjb25zdCBoZWxsb0xhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgXCJIZWxsb0xhbWJkYVwiLCB7XHJcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxyXG4gICAgICBoYW5kbGVyOiBcImluZGV4LmhhbmRsZXJcIixcclxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KFwibGFtYmRhXCIpLFxyXG4gICAgfSk7XHJcbiAgICAvLyBMYW1iZGEgZnVuY3Rpb24gZm9yIHVwbG9haWRuZyBvYmplY3RzIHRvIHVwbG9hZGJ1Y2tldCBzM1xyXG4gICAgY29uc3QgdXBsb2FkTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAndXBsb2FkTGFtYmRhJywge1xyXG4gICAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgICAgICBoYW5kbGVyOiAndXBsb2Fkb2JqLmhhbmRsZXInLFxyXG4gICAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KFwibGFtYmRhXCIpLFxyXG4gICAgICAgICAgZW52aXJvbm1lbnQ6IHtcclxuICAgICAgICAgICAgQlVDS0VUX05BTUU6IHVwbG9hZG9iakJ1Y2tldC5idWNrZXROYW1lLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBHcmFudCBwZXJtaXNzaW9uc1xyXG4gICAgdXBsb2Fkb2JqQnVja2V0LmdyYW50UHV0KHVwbG9hZExhbWJkYSk7XHJcblxyXG4gICAgLy8gTGFtYmRhIGZ1bmN0aW9uIHRvIGdldCB1cGxvYWQgaGlzdG9yeVxyXG4gICAgY29uc3QgdXBsb2FkSGlzdG9yeUxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ3VwbG9hZEhpc3RvcnlMYW1iZGEnLCB7XHJcbiAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcclxuICAgIGhhbmRsZXI6ICdnZXRVcGxvYWRIaXN0b3J5LmhhbmRsZXInLFxyXG4gICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KFwibGFtYmRhXCIpLFxyXG4gICAgZW52aXJvbm1lbnQ6IHtcclxuICAgICBCVUNLRVRfTkFNRTogdXBsb2Fkb2JqQnVja2V0LmJ1Y2tldE5hbWUsXHJcbiAgfSxcclxuICB9KTtcclxuICAgIHVwbG9hZEhpc3RvcnlMYW1iZGEuYWRkRW52aXJvbm1lbnQoXCJVUExPQURfQlVDS0VUXCIsIHVwbG9hZG9iakJ1Y2tldC5idWNrZXROYW1lKTtcclxuICAgIHVwbG9hZG9iakJ1Y2tldC5ncmFudFJlYWQodXBsb2FkSGlzdG9yeUxhbWJkYSk7XHJcbiAgICAvKiB1cGxvYWRvYmpCdWNrZXQuZ3JhbnQodXBsb2FkSGlzdG9yeUxhbWJkYSwgXCJzMzpMaXN0QnVja2V0XCIpOyAqL1xyXG5cclxuXHJcbiAgICAvLyBHcmFudCBwZXJtaXNzaW9ucyBmb3IgTGFtYmRhIGZ1bmN0aW9ucyB0byBpbnRlcmFjdCB3aXRoIER5bmFtb0RCXHJcbiAgICBkYlN0YWNrLmNhc2VzVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKGluc2VydENhc2VMYW1iZGEpO1xyXG4gICAgZGJTdGFjay5jYXNlc1RhYmxlLmdyYW50UmVhZERhdGEoZ2V0Q2FzZXNMYW1iZGEpO1xyXG4gICAgZGJTdGFjay5jYXNlc1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShpbnNlcnRTYW1wbGVDYXNlTGFtYmRhKTtcclxuXHJcbiAgICBcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIEFQSSBHYXRld2F5XHJcbiAgICBjb25zdCBhcGkgPSBuZXcgYXBpZ2F0ZXdheS5SZXN0QXBpKHRoaXMsIFwiW1NlbnNlQUldQXBpXCIsIHtcclxuICAgICAgcmVzdEFwaU5hbWU6IFwiIFNlbnNBSSBTZXJ2aWNlXCIsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlRoaXMgaXMgdGhlIGV4aXN0aW5nIEFQSVwiXHJcblxyXG4gICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHVwbG9hZG9iaiA9IGFwaS5yb290LmFkZFJlc291cmNlKFwidXBsb2Fkb2JqXCIpO1xyXG4gICAgICAgICAgICAgIHVwbG9hZG9iai5hZGRNZXRob2QoXCJHRVRcIiwgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXBsb2FkTGFtYmRhKSwgeyAvL2ZvciB0ZXN0aW5nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0aG9yaXphdGlvblR5cGU6IGFwaWdhdGV3YXkuQXV0aG9yaXphdGlvblR5cGUuTk9ORSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RSZXNwb25zZXM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogXCIyMDBcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzXCI6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHNcIjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGxvYWRvYmouYWRkQ29yc1ByZWZsaWdodCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYWxsb3dPcmlnaW5zOiBbXCJodHRwOi8vbG9jYWxob3N0OjMwMDBcIl0sIC8vIG9yIFtcImh0dHBzOi8vZDEwdXJlc240eTQ3ZG8uY2xvdWRmcm9udC5uZXRcIl0gZm9yIHByb2R1Y3Rpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICBhbGxvd01ldGhvZHM6IFtcIkdFVFwiLFwiT1BUSU9OU1wiXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiBcclxuICAgICAgICAgICAgICAgICAgLy8gQWRkaW5nIFBPU1QgbWV0aG9kXHJcbiAgICAgICAgICAgICAgICAgIHVwbG9hZG9iai5hZGRNZXRob2QoXCJQT1NUXCIsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVwbG9hZExhbWJkYSksIHtcclxuICAgICAgICAgICAgICAgICAgICBhdXRob3JpemF0aW9uVHlwZTogYXBpZ2F0ZXdheS5BdXRob3JpemF0aW9uVHlwZS5OT05FLFxyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZFJlc3BvbnNlczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnNcIjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kc1wiOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICB9KTtcclxuXHJcblxyXG5cclxuXHJcbiAgICAgICAgY29uc3QgdXBsb2FkaGlzdG9yeSA9IGFwaS5yb290LmFkZFJlc291cmNlKCd1cGxvYWRoaXN0b3J5Jyk7XHJcbiAgICAgICAgdXBsb2FkaGlzdG9yeS5hZGRNZXRob2QoJ0dFVCcsbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXBsb2FkSGlzdG9yeUxhbWJkYSksIHsgLy9mb3IgdGVzdGluZ1xyXG4gICAgICAgICAgYXV0aG9yaXphdGlvblR5cGU6IGFwaWdhdGV3YXkuQXV0aG9yaXphdGlvblR5cGUuTk9ORSxcclxuICAgICAgICAgIG1ldGhvZFJlc3BvbnNlczogW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIHN0YXR1c0NvZGU6IFwiMjAwXCIsXHJcbiAgICAgICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XHJcbiAgICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVyc1wiOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHNcIjogdHJ1ZSxcclxuICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIF0sXHJcblxyXG4gICAgICAgICAgXHJcbiAgICAgICAgfSk7IFxyXG5cclxuICAgICAgICB1cGxvYWRoaXN0b3J5LmFkZENvcnNQcmVmbGlnaHQoe1xyXG4gICAgICAgICAgYWxsb3dPcmlnaW5zOiBbXCJodHRwOi8vbG9jYWxob3N0OjMwMDBcIl0sXHJcbiAgICAgICAgICBhbGxvd01ldGhvZHM6IFtcIkdFVFwiLFwiT1BUSU9OU1wiXSxcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuXHJcbiAgICAgICAgLyogY29uc3QgcHJvY2Vzc2VkQnVja2V0TmFtZSA9IGNkay5Gbi5pbXBvcnRWYWx1ZSgnUHJvY2Vzc2VkQnVja2V0TmFtZScpOyAqL1xyXG4gICAgLy8gTGFtYmRhOiBUcmlnZ2VyUHJlcHJvY2Vzc2luZ0xhbWJkYVxyXG4gICAgICAgIGNvbnN0IHRyaWdnZXJQcmVwcm9jZXNzaW5nTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCBcIlRyaWdnZXJQcmVwcm9jZXNzaW5nTGFtYmRhXCIsIHtcclxuICAgICAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxyXG4gICAgICAgICAgaGFuZGxlcjogXCJ0cmlnZ2VyUHJlcHJvY2Vzc2luZ0pvYi5oYW5kbGVyXCIsXHJcbiAgICAgICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoXCJsYW1iZGFcIiksXHJcbiAgICAgICAgICBlbnZpcm9ubWVudDoge1xyXG4gICAgICAgICAgICBTQUdFTUFLRVJfUk9MRV9BUk46IFwiYXJuOmF3czppYW06OjEyMzQ1Njc4OTAxMjpyb2xlL1NhZ2VNYWtlckV4ZWN1dGlvblJvbGVcIixcclxuICAgICAgICAgICAgSU1BR0VfVVJJOiBcIjEyMzQ1Njc4OTAxMi5ka3IuZWNyLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tL215LXByZXByb2Nlc3NpbmctaW1hZ2U6bGF0ZXN0XCIsXHJcbiAgICAgICAgICAgIElOUFVUX1MzX1VSSTogdXBsb2Fkb2JqQnVja2V0LmJ1Y2tldE5hbWUsXHJcbiAgICAgICAgICAgIE9VVFBVVF9TM19VUkk6IGBzMzovLyR7cHJvY2Vzc2VkQnVja2V0LmJ1Y2tldE5hbWV9L3ByZWZpbmFsLW91dHB1dC9gLCAvLyB1cGRhdGVkIHBhdGhcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSk7XHJcbiAgICBcclxuICAgICAgICAvLyBBbGxvdyBUcmlnZ2VyIExhbWJkYSB0byBjcmVhdGUgU2FnZU1ha2VyIGpvYnNcclxuICAgICAgICB0cmlnZ2VyUHJlcHJvY2Vzc2luZ0xhbWJkYS5hZGRUb1JvbGVQb2xpY3koXHJcbiAgICAgICAgICBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XHJcbiAgICAgICAgICAgIGFjdGlvbnM6IFtcInNhZ2VtYWtlcjpDcmVhdGVQcm9jZXNzaW5nSm9iXCJdLFxyXG4gICAgICAgICAgICByZXNvdXJjZXM6IFtcIipcIl0sXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICk7XHJcbiAgICBcclxuICAgICAgICAvLyBUcmlnZ2VyIHRoZSBMYW1iZGEgd2hlbiBhIG5ldyBvYmplY3QgaXMgY3JlYXRlZCBpbiByYXcgYnVja2V0XHJcbiAgICAgICAgdXBsb2Fkb2JqQnVja2V0LmFkZEV2ZW50Tm90aWZpY2F0aW9uKFxyXG4gICAgICAgICAgczMuRXZlbnRUeXBlLk9CSkVDVF9DUkVBVEVELFxyXG4gICAgICAgICAgbmV3IHMzbi5MYW1iZGFEZXN0aW5hdGlvbih0cmlnZ2VyUHJlcHJvY2Vzc2luZ0xhbWJkYSlcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBjb25zdCBwcmVQcm9jZXNzaW5nID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoXCJwcmUtcHJvY2Vzc2luZ1wiKTtcclxuICAgIFxyXG4gICAgICAgIC8vIFBPU1QgTWV0aG9kOiBUcmlnZ2VyIHRoZSBQcmVwcm9jZXNzaW5nIEpvYlxyXG4gICAgICAgIHByZVByb2Nlc3NpbmcuYWRkTWV0aG9kKFwiUE9TVFwiLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih0cmlnZ2VyUHJlcHJvY2Vzc2luZ0xhbWJkYSksIHtcclxuICAgICAgICBhdXRob3JpemF0aW9uVHlwZTogYXBpZ2F0ZXdheS5BdXRob3JpemF0aW9uVHlwZS5OT05FLFxyXG4gICAgICAgIG1ldGhvZFJlc3BvbnNlczogW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IFwiMjAwXCIsXHJcbiAgICAgICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xyXG4gICAgICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnNcIjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzXCI6IHRydWUsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgICB9KTtcclxuICAgIFxyXG4gICAgICAgIC8vIExhbWJkYTogUHJvY2Vzc2VkRGF0YVN0b3JpbmdMYW1iZGFcclxuICAgICAgICBjb25zdCBwcm9jZXNzZWREYXRhU3RvcmluZ0xhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgXCJQcm9jZXNzZWREYXRhU3RvcmluZ0xhbWJkYVwiLCB7XHJcbiAgICAgICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcclxuICAgICAgICAgIGhhbmRsZXI6IFwicHJvY2Vzc2VkRGF0YVN0b3JpbmcuaGFuZGxlclwiLFxyXG4gICAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KFwibGFtYmRhXCIpLFxyXG4gICAgICAgICAgZW52aXJvbm1lbnQ6IHtcclxuICAgICAgICAgICAgSU5QVVRfUFJFRklYOiBcInByZWZpbmFsLW91dHB1dC9cIiwgICAgICAgICAgICAvLyBSZWFkIGZyb20gdGhpcyBmb2xkZXJcclxuICAgICAgICAgICAgT1VUUFVUX0JVQ0tFVDogcHJvY2Vzc2VkQnVja2V0LmJ1Y2tldE5hbWUsICAgLy8gU3RpbGwgdGhlIHNhbWUgYnVja2V0XHJcbiAgICAgICAgICAgIE9VVFBVVF9QUkVGSVg6IFwiZmluYWwtcHJvY2Vzc2VkL1wiLCAgICAgICAgICAgLy8gV3JpdGUgdG8gdGhpcyBmb2xkZXJcclxuICAgICAgICAgICAgRFlOQU1PREJfVEFCTEVfTkFNRTogZHluYW1vVGFibGUsICAgICAgICAgICAgLy8gRHluYW1vREIgdGFibGUgbmFtZVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9KTtcclxuICAgIFxyXG4gICAgICAgIC8vIEFsbG93IExhbWJkYSB0byBhY2Nlc3MgYm90aCByZWFkICYgd3JpdGUgaW4gcHJvY2Vzc2VkIGJ1Y2tldFxyXG4gICAgICAgIHByb2Nlc3NlZEJ1Y2tldC5ncmFudFJlYWRXcml0ZShwcm9jZXNzZWREYXRhU3RvcmluZ0xhbWJkYSk7XHJcbiAgICBcclxuICAgICAgICAvLyBHcmFudCBwZXJtaXNzaW9uIHRvIHdyaXRlIHRvIER5bmFtb0RCIHRhYmxlXHJcbiAgICAgICAgcHJvY2Vzc2VkRGF0YVN0b3JpbmdMYW1iZGEuYWRkVG9Sb2xlUG9saWN5KFxyXG4gICAgICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xyXG4gICAgICAgICAgICBhY3Rpb25zOiBbXCJkeW5hbW9kYjpQdXRJdGVtXCJdLFxyXG4gICAgICAgICAgICByZXNvdXJjZXM6IFtgYXJuOmF3czpkeW5hbW9kYjp1cy1lYXN0LTE6MTIzNDU2Nzg5MDEyOnRhYmxlLyR7ZHluYW1vVGFibGV9YF0sXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICk7XHJcbiAgICBcclxuICAgIFxyXG4gICAgICAgIC8vIEdFVCBNZXRob2Q6IFN0b3JlIHRoZSBQcm9jZXNzZWQgRGF0YVxyXG4gICAgICAgIHByZVByb2Nlc3NpbmcuYWRkTWV0aG9kKFwiR0VUXCIsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHByb2Nlc3NlZERhdGFTdG9yaW5nTGFtYmRhKSwge1xyXG4gICAgICAgIGF1dGhvcml6YXRpb25UeXBlOiBhcGlnYXRld2F5LkF1dGhvcml6YXRpb25UeXBlLk5PTkUsXHJcbiAgICAgICAgbWV0aG9kUmVzcG9uc2VzOiBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3RhdHVzQ29kZTogXCIyMDBcIixcclxuICAgICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XHJcbiAgICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVyc1wiOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHNcIjogdHJ1ZSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICBdLFxyXG4gICAgICAgIH0pO1xyXG4gICAgXHJcbiAgICAgICAgLy8gQ09SUyBQcmVmbGlnaHQgZm9yIGJvdGggbWV0aG9kXHJcbiAgICAgICAgcHJlUHJvY2Vzc2luZy5hZGRDb3JzUHJlZmxpZ2h0KHtcclxuICAgICAgICBhbGxvd09yaWdpbnM6IFtcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMFwiXSwgLy8gQWxsb3cgZnJvbSBhbGwgb3JpZ2lucyBvciBzcGVjaWZ5IHlvdXIgZnJvbnRlbmQgZG9tYWluXHJcbiAgICAgICAgYWxsb3dNZXRob2RzOiBbXCJHRVRcIiwgXCJPUFRJT05TXCIsXCJQT1NUXCJdLFxyXG4gICAgICAgIH0pO1xyXG4gICAgXHJcblxyXG4gICAgLyogLy8gUmVzb3VyY2UgZm9yICcvY2FzZXMnIHRvIGluc2VydCBuZXcgY2FzZVxyXG4gICAgY29uc3QgY2FzZXMgPSBhcGkucm9vdC5hZGRSZXNvdXJjZShcImNhc2VzXCIpO1xyXG4gICAgY2FzZXMuYWRkTWV0aG9kKFwiUE9TVFwiLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihpbnNlcnRDYXNlTGFtYmRhKSk7IC8vIFBPU1QgL2Nhc2VzXHJcbiAgICBjYXNlcy5hZGRNZXRob2QoXCJHRVRcIiwgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oZ2V0Q2FzZXNMYW1iZGEpKTsgICAvLyBHRVQgL2Nhc2VzXHJcblxyXG4gICAgLy8gUmVzb3VyY2UgZm9yICcvY2FzZXMvc2FtcGxlJyB0byBpbnNlcnQgc2FtcGxlIGNhc2VzXHJcbiAgICBjb25zdCBzYW1wbGVDYXNlcyA9IGNhc2VzLmFkZFJlc291cmNlKFwic2FtcGxlXCIpO1xyXG4gICAgc2FtcGxlQ2FzZXMuYWRkTWV0aG9kKFwiUE9TVFwiLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihpbnNlcnRTYW1wbGVDYXNlTGFtYmRhKSk7Ki8gIC8vIFBPU1QgL2Nhc2VzL3NhbXBsZVxyXG5cclxuICAgIC8vIFJlc291cmNlIGZvciAnL2hlbGxvJ1xyXG4gICAgY29uc3QgaGVsbG8gPSBhcGkucm9vdC5hZGRSZXNvdXJjZShcImhlbGxvXCIpO1xyXG4gICAgaGVsbG8uYWRkTWV0aG9kKFwiR0VUXCIsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGhlbGxvTGFtYmRhKSk7ICAvLyBHRVQgL2hlbGxvIFxyXG5cclxuICAgIC8vIE91dHB1dHMgZm9yIGJvdGggQVBJc1xyXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJBcGlFbmRwb2ludFwiLCB7XHJcbiAgICAgIHZhbHVlOiBhcGkudXJsLCAgLy8gQ29tYmluZWQgQVBJIFVSTFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcbiJdfQ==