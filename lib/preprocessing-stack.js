"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreprocessingStack = void 0;
const cdk = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const s3 = require("aws-cdk-lib/aws-s3");
const iam = require("aws-cdk-lib/aws-iam");
const apigateway = require("aws-cdk-lib/aws-apigateway");
const s3n = require("aws-cdk-lib/aws-s3-notifications");
class PreprocessingStack extends cdk.Stack {
    constructor(scope, id, props) {
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
        triggerPreprocessingLambda.addToRolePolicy(new iam.PolicyStatement({
            actions: ["sagemaker:CreateProcessingJob"],
            resources: ["*"],
        }));
        // Trigger the Lambda when a new object is created in raw bucket
        uploadobjBucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(triggerPreprocessingLambda));
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
        processedDataStoringLambda.addToRolePolicy(new iam.PolicyStatement({
            actions: ["dynamodb:PutItem"],
            resources: ["arn:aws:dynamodb:us-east-1:123456789012:table/YourDynamoTableName"], // Replace with actual
        }));
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
exports.PreprocessingStack = PreprocessingStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlcHJvY2Vzc2luZy1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInByZXByb2Nlc3Npbmctc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBRW5DLGlEQUFpRDtBQUNqRCx5Q0FBeUM7QUFDekMsMkNBQTJDO0FBQzNDLHlEQUF5RDtBQUN6RCx3REFBd0Q7QUFFeEQsTUFBYSxrQkFBbUIsU0FBUSxHQUFHLENBQUMsS0FBSztJQUMvQyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzlELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLG1CQUFtQjtRQUNuQixNQUFNLGVBQWUsR0FBRyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFO1lBQzdELGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU87WUFDeEMsaUJBQWlCLEVBQUUsSUFBSTtZQUN2QixJQUFJLEVBQUUsQ0FBQztvQkFDTCxjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUM7b0JBQ3JCLGNBQWMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO29CQUNsRyxjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUM7aUJBQ3RCLENBQUM7U0FDSCxDQUFDLENBQUM7UUFFSCw0QkFBNEI7UUFDNUIsTUFBTSxlQUFlLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtZQUM3RCxhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPO1lBQ3hDLGlCQUFpQixFQUFFLElBQUk7U0FDeEIsQ0FBQyxDQUFDO1FBRUgsY0FBYztRQUNk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QUFDLGlCQUFpQixDQUFDLDBCQUEwQixDQUFDLEVBQUU7WUFDM0YsaUJBQWlCLEVBQUUsVUFBVSxDQUFDLGlCQUFpQixDQUFDLElBQUk7WUFDcEQsZUFBZSxFQUFFO2dCQUNmO29CQUNFLFVBQVUsRUFBRSxLQUFLO29CQUNqQixrQkFBa0IsRUFBRTt3QkFDbEIsb0RBQW9ELEVBQUUsSUFBSTt3QkFDMUQscURBQXFELEVBQUUsSUFBSTt3QkFDM0QscURBQXFELEVBQUUsSUFBSTtxQkFDNUQ7aUJBQ0Y7YUFDRjtTQUNGLENBQUMsQ0FBQztRQUVILCtFQUErRTtJQUNqRixDQUFDO0NBQ0Y7QUEvR0QsZ0RBK0dDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcclxuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XHJcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcclxuaW1wb3J0ICogYXMgczMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzJztcclxuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xyXG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5JztcclxuaW1wb3J0ICogYXMgczNuIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMy1ub3RpZmljYXRpb25zJztcclxuXHJcbmV4cG9ydCBjbGFzcyBQcmVwcm9jZXNzaW5nU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xyXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcclxuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xyXG5cclxuICAgIC8vIFByb2Nlc3NlZCBidWNrZXRcclxuICAgIGNvbnN0IHByb2Nlc3NlZEJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgXCJQcm9jZXNzZWRCdWNrZXRcIiwge1xyXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxyXG4gICAgICBhdXRvRGVsZXRlT2JqZWN0czogdHJ1ZSxcclxuICAgICAgY29yczogW3tcclxuICAgICAgICBhbGxvd2VkT3JpZ2luczogW1wiKlwiXSxcclxuICAgICAgICBhbGxvd2VkTWV0aG9kczogW3MzLkh0dHBNZXRob2RzLlBVVCwgczMuSHR0cE1ldGhvZHMuR0VULCBzMy5IdHRwTWV0aG9kcy5IRUFELCBzMy5IdHRwTWV0aG9kcy5QT1NUXSxcclxuICAgICAgICBhbGxvd2VkSGVhZGVyczogW1wiKlwiXSxcclxuICAgICAgfV0sXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBVcGxvYWQgKHJhdyBpbnB1dCkgYnVja2V0XHJcbiAgICBjb25zdCB1cGxvYWRvYmpCdWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsIFwiVXBsb2FkT2JqQnVja2V0XCIsIHtcclxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcclxuICAgICAgYXV0b0RlbGV0ZU9iamVjdHM6IHRydWUsXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBBUEkgR2F0ZXdheVxyXG4gICAgY29uc3QgYXBpID0gbmV3IGFwaWdhdGV3YXkuUmVzdEFwaSh0aGlzLCAnU2Vuc2VBSS1BUEknLCB7XHJcbiAgICAgIHJlc3RBcGlOYW1lOiAnU2Vuc2VBSSBTZXJ2aWNlJyxcclxuICAgICAgZGVmYXVsdENvcnNQcmVmbGlnaHRPcHRpb25zOiB7XHJcbiAgICAgICAgYWxsb3dPcmlnaW5zOiBhcGlnYXRld2F5LkNvcnMuQUxMX09SSUdJTlMsXHJcbiAgICAgICAgYWxsb3dNZXRob2RzOiBhcGlnYXRld2F5LkNvcnMuQUxMX01FVEhPRFMsXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBMYW1iZGE6IFRyaWdnZXJQcmVwcm9jZXNzaW5nTGFtYmRhXHJcbiAgICBjb25zdCB0cmlnZ2VyUHJlcHJvY2Vzc2luZ0xhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgXCJUcmlnZ2VyUHJlcHJvY2Vzc2luZ0xhbWJkYVwiLCB7XHJcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoXCJsYW1iZGFcIiksXHJcbiAgICAgICBoYW5kbGVyOiBcInRyaWdnZXJQcmVwcm9jZXNzaW5nSm9iLmhhbmRsZXJcIixcclxuICAgICAgZW52aXJvbm1lbnQ6IHtcclxuICAgICAgICBTQUdFTUFLRVJfUk9MRV9BUk46IFwiYXJuOmF3czppYW06OjEyMzQ1Njc4OTAxMjpyb2xlL1NhZ2VNYWtlckV4ZWN1dGlvblJvbGVcIixcclxuICAgICAgICBJTUFHRV9VUkk6IFwiMTIzNDU2Nzg5MDEyLmRrci5lY3IudXMtZWFzdC0xLmFtYXpvbmF3cy5jb20vbXktcHJlcHJvY2Vzc2luZy1pbWFnZTpsYXRlc3RcIixcclxuICAgICAgICBJTlBVVF9TM19VUkk6IHVwbG9hZG9iakJ1Y2tldC5idWNrZXROYW1lLFxyXG4gICAgICAgIE9VVFBVVF9TM19VUkk6IGBzMzovLyR7cHJvY2Vzc2VkQnVja2V0LmJ1Y2tldE5hbWV9L3ByZWZpbmFsLW91dHB1dC9gLFxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgdHJpZ2dlclByZXByb2Nlc3NpbmdMYW1iZGEuYWRkVG9Sb2xlUG9saWN5KFxyXG4gICAgICBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XHJcbiAgICAgICAgYWN0aW9uczogW1wic2FnZW1ha2VyOkNyZWF0ZVByb2Nlc3NpbmdKb2JcIl0sXHJcbiAgICAgICAgcmVzb3VyY2VzOiBbXCIqXCJdLFxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBUcmlnZ2VyIHRoZSBMYW1iZGEgd2hlbiBhIG5ldyBvYmplY3QgaXMgY3JlYXRlZCBpbiByYXcgYnVja2V0XHJcbiAgICB1cGxvYWRvYmpCdWNrZXQuYWRkRXZlbnROb3RpZmljYXRpb24oXHJcbiAgICAgIHMzLkV2ZW50VHlwZS5PQkpFQ1RfQ1JFQVRFRCxcclxuICAgICAgbmV3IHMzbi5MYW1iZGFEZXN0aW5hdGlvbih0cmlnZ2VyUHJlcHJvY2Vzc2luZ0xhbWJkYSlcclxuICAgICk7XHJcblxyXG4gICAgY29uc3QgcHJlUHJvY2Vzc2luZyA9IGFwaS5yb290LmFkZFJlc291cmNlKFwicHJlLXByb2Nlc3NpbmdcIik7XHJcblxyXG4gICAgcHJlUHJvY2Vzc2luZy5hZGRNZXRob2QoXCJQT1NUXCIsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHRyaWdnZXJQcmVwcm9jZXNzaW5nTGFtYmRhKSwge1xyXG4gICAgICBhdXRob3JpemF0aW9uVHlwZTogYXBpZ2F0ZXdheS5BdXRob3JpemF0aW9uVHlwZS5OT05FLFxyXG4gICAgICBtZXRob2RSZXNwb25zZXM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxyXG4gICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XHJcbiAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogdHJ1ZSxcclxuICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnNcIjogdHJ1ZSxcclxuICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHNcIjogdHJ1ZSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgXSxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIExhbWJkYTogUHJvY2Vzc2VkRGF0YVN0b3JpbmdMYW1iZGFcclxuICAgIGNvbnN0IHByb2Nlc3NlZERhdGFTdG9yaW5nTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCBcIlByb2Nlc3NlZERhdGFTdG9yaW5nTGFtYmRhXCIsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgIGhhbmRsZXI6IFwicHJvY2Vzc2VkRGF0YVN0b3JpbmcuaGFuZGxlclwiLFxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoXCJsYW1iZGFcIiksXHJcbiAgICAgIGVudmlyb25tZW50OiB7XHJcbiAgICAgICAgSU5QVVRfUFJFRklYOiBcInByZWZpbmFsLW91dHB1dC9cIixcclxuICAgICAgICBPVVRQVVRfQlVDS0VUOiBwcm9jZXNzZWRCdWNrZXQuYnVja2V0TmFtZSxcclxuICAgICAgICBPVVRQVVRfUFJFRklYOiBcImZpbmFsLXByb2Nlc3NlZC9cIixcclxuICAgICAgICBEWU5BTU9EQl9UQUJMRV9OQU1FOiBcIllvdXJEeW5hbW9UYWJsZU5hbWVcIiwgLy8gUmVwbGFjZSB3aXRoIGFjdHVhbCB0YWJsZSBuYW1lXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBwcm9jZXNzZWRCdWNrZXQuZ3JhbnRSZWFkV3JpdGUocHJvY2Vzc2VkRGF0YVN0b3JpbmdMYW1iZGEpO1xyXG5cclxuICAgIHByb2Nlc3NlZERhdGFTdG9yaW5nTGFtYmRhLmFkZFRvUm9sZVBvbGljeShcclxuICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xyXG4gICAgICAgIGFjdGlvbnM6IFtcImR5bmFtb2RiOlB1dEl0ZW1cIl0sXHJcbiAgICAgICAgcmVzb3VyY2VzOiBbXCJhcm46YXdzOmR5bmFtb2RiOnVzLWVhc3QtMToxMjM0NTY3ODkwMTI6dGFibGUvWW91ckR5bmFtb1RhYmxlTmFtZVwiXSwgLy8gUmVwbGFjZSB3aXRoIGFjdHVhbFxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBHRVQ6IHJlYWQgcHJvY2Vzc2VkIGRhdGFcclxuICAgIHByZVByb2Nlc3NpbmcuYWRkTWV0aG9kKFwiR0VUXCIsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHByb2Nlc3NlZERhdGFTdG9yaW5nTGFtYmRhKSwge1xyXG4gICAgICBhdXRob3JpemF0aW9uVHlwZTogYXBpZ2F0ZXdheS5BdXRob3JpemF0aW9uVHlwZS5OT05FLFxyXG4gICAgICBtZXRob2RSZXNwb25zZXM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxyXG4gICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XHJcbiAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogdHJ1ZSxcclxuICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnNcIjogdHJ1ZSxcclxuICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHNcIjogdHJ1ZSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgXSxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIERvIE5PVCBhZGQgYWRkQ29yc1ByZWZsaWdodCgpIGhlcmUgYWdhaW4g4oCTIGl0IGNhdXNlcyBkdXBsaWNhdGUgT1BUSU9OUyBlcnJvclxyXG4gIH1cclxufVxyXG5cclxuIl19