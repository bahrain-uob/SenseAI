"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIStack = void 0;
const cdk = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const apigateway = require("aws-cdk-lib/aws-apigateway");
class APIStack extends cdk.Stack {
    constructor(scope, id, dbStack, TransactionUploadsBucket, props) {
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
        upload.addMethod("GET", new apigateway.LambdaIntegration(GetUploadUrlLambda), {
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
            allowOrigins: ["https://d10uresn4y47do.cloudfront.net"], // or ["https://d10uresn4y47do.cloudfront.net"] for production
            allowMethods: ["GET","PUT","OPTION","HEAD"],
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
                  allowOrigins: ["https://d10uresn4y47do.cloudfront.net"],
                  allowMethods: ["GET"],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBpLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUNuQyxpREFBaUQ7QUFFakQseURBQXlEO0FBU3pELE1BQWEsUUFBUyxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBRXJDLFlBQVksS0FBYyxFQUFFLEVBQVUsRUFBRSxPQUFnQixFQUFDLHdCQUFrQyxFQUFFLEtBQXNCO1FBQ2pILEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRWhCLE1BQU0sWUFBWSxHQUFHLHdCQUF3QixDQUFDO1FBQzlDLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRTtZQUN2RSxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLE9BQU8sRUFBRSxzQkFBc0I7WUFDL0IsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztZQUNyQyxXQUFXLEVBQUU7Z0JBQ2IsV0FBVyxFQUFFLFlBQVksQ0FBQyxVQUFVO2FBQ25DO1NBQ0osQ0FBQyxDQUFDO1FBRUgseUNBQXlDO1FBQ3pDLFlBQVksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUVsRCx1REFBdUQ7UUFDdkQsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLHdCQUF3QixFQUFFO1lBQ2pGLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsT0FBTyxFQUFFLDBCQUEwQixFQUFHLDRDQUE0QztZQUNsRixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO1lBQ3JDLFdBQVcsRUFBRTtnQkFDWCxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsVUFBVSxD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Rix3QkFBd0I7UUFDeEIsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDckMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUcsbUJBQW1CO1NBQ3JDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQTdHRCw0QkE2R0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSBcImF3cy1jZGstbGliXCI7XHJcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWxhbWJkYVwiO1xyXG5pbXBvcnQgKiBhcyBzMyBmcm9tIFwiYXdzLWNkay1saWIvYXdzLXMzXCJcclxuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXlcIjtcclxuaW1wb3J0IHsgREJTdGFjayB9IGZyb20gXCIuL0RCc3RhY2tcIjsgLy8gSW1wb3J0IERCU3RhY2tcclxuXHJcbmltcG9ydCB7IE15Q2RrU3RhY2sgfSBmcm9tIFwiLi9teS1jZGstYXBwLXN0YWNrXCI7XHJcblxyXG5cclxuXHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIEFQSVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcclxuICBwdWJsaWMgcmVhZG9ubHkgVHJhbnNhY3Rpb25VcGxvYWRzQnVja2V0OiBzMy5CdWNrZXQ7XHJcbiAgY29uc3RydWN0b3Ioc2NvcGU6IGNkay5BcHAsIGlkOiBzdHJpbmcsIGRiU3RhY2s6IERCU3RhY2ssVHJhbnNhY3Rpb25VcGxvYWRzQnVja2V0OnMzLkJ1Y2tldCwgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcywpIHtcclxuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgdXBsb2FkQnVja2V0ID0gVHJhbnNhY3Rpb25VcGxvYWRzQnVja2V0O1xyXG4gICAgICAgICAgICBjb25zdCBHZXRVcGxvYWRVcmxMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsIFwiR2V0VXBsb2FkVXJsTGFtYmRhXCIsIHtcclxuICAgICAgICAgICAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxyXG4gICAgICAgICAgICAgICAgaGFuZGxlcjogXCJnZXRVcGxvYWRVcmwuaGFuZGxlclwiLFxyXG4gICAgICAgICAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KFwibGFtYmRhXCIpLFxyXG4gICAgICAgICAgICAgICAgZW52aXJvbm1lbnQ6IHtcclxuICAgICAgICAgICAgICAgIEJVQ0tFVF9OQU1FOiB1cGxvYWRCdWNrZXQuYnVja2V0TmFtZSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gR2l2ZSBMYW1iZGEgcGVybWlzc2lvbiB0byB1cGxvYWQgdG8gUzNcclxuICAgICAgICAgICAgdXBsb2FkQnVja2V0LmdyYW50UHV0KEdldFVwbG9hZFVybExhbWJkYSk7XHJcblxyXG4gICAgLy8gTGFtYmRhIGZ1bmN0aW9uIHRvIGluc2VydCBzYW1wbGUgY2FzZXMgaW50byBEeW5hbW9EQlxyXG4gICAgY29uc3QgaW5zZXJ0U2FtcGxlQ2FzZUxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgXCJJbnNlcnRTYW1wbGVDYXNlTGFtYmRhXCIsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgIGhhbmRsZXI6IFwiaW5zZXJ0U2FtcGxlQ2FzZS5oYW5kbGVyXCIsICAvLyBFbnN1cmUgdGhpcyBwb2ludHMgdG8gdGhlIGNvcnJlY3QgaGFuZGxlclxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoXCJsYW1iZGFcIiksXHJcbiAgICAgIGVudmlyb25tZW50OiB7XHJcbiAgICAgICAgQ0FTRVNfVEFCTEVfTkFNRTogZGJTdGFjay5jYXNlc1RhYmxlLnRhYmxlTmFtZSwgLy8gUGFzcyB0YWJsZSBuYW1lIGFzIGVudmlyb25tZW50IHZhcmlhYmxlXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBMYW1iZGEgZnVuY3Rpb24gdG8gaW5zZXJ0IG5ldyBjYXNlIGludG8gRHluYW1vREJcclxuICAgIGNvbnN0IGluc2VydENhc2VMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsIFwiSW5zZXJ0Q2FzZUxhbWJkYVwiLCB7XHJcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxyXG4gICAgICBoYW5kbGVyOiBcImluc2VydENhc2UuaGFuZGxlclwiLFxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoXCJsYW1iZGFcIiksXHJcbiAgICAgIGVudmlyb25tZW50OiB7XHJcbiAgICAgICAgQ0FTRVNfVEFCTEVfTkFNRTogZGJTdGFjay5jYXNlc1RhYmxlLnRhYmxlTmFtZSxcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIExhbWJkYSBmdW5jdGlvbiB0byBnZXQgYWxsIGNhc2VzIGZyb20gRHluYW1vREJcclxuICAgIGNvbnN0IGdldENhc2VzTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCBcIkdldENhc2VzTGFtYmRhXCIsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgIGhhbmRsZXI6IFwiZ2V0Q2FzZXMuaGFuZGxlclwiLFxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoXCJsYW1iZGFcIiksXHJcbiAgICAgIGVudmlyb25tZW50OiB7XHJcbiAgICAgICAgQ0FTRVNfVEFCTEVfTkFNRTogZGJTdGFjay5jYXNlc1RhYmxlLnRhYmxlTmFtZSxcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIExhbWJkYSBmdW5jdGlvbiBmb3IgSGVsbG8gV29ybGRcclxuICAgIGNvbnN0IGhlbGxvTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCBcIkhlbGxvTGFtYmRhXCIsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgIGhhbmRsZXI6IFwiaW5kZXguaGFuZGxlclwiLFxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoXCJsYW1iZGFcIiksXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBHcmFudCBwZXJtaXNzaW9ucyBmb3IgTGFtYmRhIGZ1bmN0aW9ucyB0byBpbnRlcmFjdCB3aXRoIER5bmFtb0RCXHJcbiAgICBkYlN0YWNrLmNhc2VzVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKGluc2VydENhc2VMYW1iZGEpO1xyXG4gICAgZGJTdGFjay5jYXNlc1RhYmxlLmdyYW50UmVhZERhdGEoZ2V0Q2FzZXNMYW1iZGEpO1xyXG4gICAgZGJTdGFjay5jYXNlc1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShpbnNlcnRTYW1wbGVDYXNlTGFtYmRhKTtcclxuXHJcbiAgICBcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIEFQSSBHYXRld2F5XHJcbiAgICBjb25zdCBhcGkgPSBuZXcgYXBpZ2F0ZXdheS5SZXN0QXBpKHRoaXMsIFwiW1NlbnNlQUldQXBpXCIsIHtcclxuICAgICAgcmVzdEFwaU5hbWU6IFwiIFNlbnNBSSBTZXJ2aWNlXCIsXHJcbiAgICB9KTtcclxuICAgIC8vdXBsb2FkIGFwaSBwYXRoIHRvIHVwbG9hZCB0cmFuc2FjdGlvblxyXG4gICAgY29uc3QgdXBsb2FkID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoXCJ1cGxvYWRcIik7XHJcbiAgICB1cGxvYWQuYWRkTWV0aG9kKFwiR0VUXCIsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKEdldFVwbG9hZFVybExhbWJkYSksIHsgLy9mb3IgdGVzdGluZ1xyXG4gICAgICAgICAgICAgICAgYXV0aG9yaXphdGlvblR5cGU6IGFwaWdhdGV3YXkuQXV0aG9yaXphdGlvblR5cGUuTk9ORSxcclxuICAgICAgICAgICAgICAgIG1ldGhvZFJlc3BvbnNlczogW1xyXG4gICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IFwiMjAwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVyc1wiOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHNcIjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICBcclxuICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgdXBsb2FkLmFkZENvcnNQcmVmbGlnaHQoe1xyXG4gICAgICAgICAgICAgICAgYWxsb3dPcmlnaW5zOiBbXCIqXCJdLCAvLyBvciBbXCJodHRwczovL2QxMHVyZXNuNHk0N2RvLmNsb3VkZnJvbnQubmV0XCJdIGZvciBwcm9kdWN0aW9uXHJcbiAgICAgICAgICAgICAgICBhbGxvd01ldGhvZHM6IFtcIkdFVFwiXSxcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgXHJcblxyXG4gICAgLyogLy8gUmVzb3VyY2UgZm9yICcvY2FzZXMnIHRvIGluc2VydCBuZXcgY2FzZVxyXG4gICAgY29uc3QgY2FzZXMgPSBhcGkucm9vdC5hZGRSZXNvdXJjZShcImNhc2VzXCIpO1xyXG4gICAgY2FzZXMuYWRkTWV0aG9kKFwiUE9TVFwiLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihpbnNlcnRDYXNlTGFtYmRhKSk7IC8vIFBPU1QgL2Nhc2VzXHJcbiAgICBjYXNlcy5hZGRNZXRob2QoXCJHRVRcIiwgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oZ2V0Q2FzZXNMYW1iZGEpKTsgICAvLyBHRVQgL2Nhc2VzXHJcblxyXG4gICAgLy8gUmVzb3VyY2UgZm9yICcvY2FzZXMvc2FtcGxlJyB0byBpbnNlcnQgc2FtcGxlIGNhc2VzXHJcbiAgICBjb25zdCBzYW1wbGVDYXNlcyA9IGNhc2VzLmFkZFJlc291cmNlKFwic2FtcGxlXCIpO1xyXG4gICAgc2FtcGxlQ2FzZXMuYWRkTWV0aG9kKFwiUE9TVFwiLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihpbnNlcnRTYW1wbGVDYXNlTGFtYmRhKSk7Ki8gIC8vIFBPU1QgL2Nhc2VzL3NhbXBsZVxyXG5cclxuICAgIC8vIFJlc291cmNlIGZvciAnL2hlbGxvJ1xyXG4gICAgY29uc3QgaGVsbG8gPSBhcGkucm9vdC5hZGRSZXNvdXJjZShcImhlbGxvXCIpO1xyXG4gICAgaGVsbG8uYWRkTWV0aG9kKFwiR0VUXCIsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGhlbGxvTGFtYmRhKSk7ICAvLyBHRVQgL2hlbGxvIFxyXG5cclxuICAgIC8vIE91dHB1dHMgZm9yIGJvdGggQVBJc1xyXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJBcGlFbmRwb2ludFwiLCB7XHJcbiAgICAgIHZhbHVlOiBhcGkudXJsLCAgLy8gQ29tYmluZWQgQVBJIFVSTFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcbiJdfQ==
