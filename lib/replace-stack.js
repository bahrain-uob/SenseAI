"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplaceStack = void 0;
// Import required CDK and AWS libraries
const cdk = require("aws-cdk-lib"); // core AWS CDK functionality
const lambda = require("aws-cdk-lib/aws-lambda"); // to define Lambda functions
const s3 = require("aws-cdk-lib/aws-s3"); // to create and manage S3 buckets
const apigateway = require("aws-cdk-lib/aws-apigateway"); // to create REST APIs
// Define a new CDK stack called ReplaceStack
class ReplaceStack extends cdk.Stack {
    constructor(scope, id, props) {
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
exports.ReplaceStack = ReplaceStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwbGFjZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlcGxhY2Utc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsd0NBQXdDO0FBQ3hDLG1DQUFtQyxDQUFDLDZCQUE2QjtBQUVqRSxpREFBaUQsQ0FBQyw2QkFBNkI7QUFDL0UseUNBQXlDLENBQUMsa0NBQWtDO0FBQzVFLHlEQUF5RCxDQUFDLHNCQUFzQjtBQUVoRiw2Q0FBNkM7QUFDN0MsTUFBYSxZQUFhLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDekMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QiwwRUFBMEU7UUFDMUUsTUFBTSxZQUFZLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDdkQsYUFBYSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLDREQUE0RDtZQUN0RyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsNkRBQTZEO1NBQ3RGLENBQUMsQ0FBQztRQUVILGlFQUFpRTtRQUNqRSxNQUFNLGFBQWEsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFO1lBQy9ELE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsZ0NBQWdDO1lBQ2xDLE9BQU8sRUFBRSxlQUFlLEVBQUUsb0RBQW9EO1lBQzlFLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLGdEQUFnRDtZQUMvRixXQUFXLEVBQUU7Z0JBQ1gsV0FBVyxFQUFFLFlBQVksQ0FBQyxVQUFVLENBQUMsNERBQTREO2FBQ2xHO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsb0VBQW9FO1FBQ3BFLFlBQVksQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFM0MscUZBQXFGO1FBQ3JGLE1BQU0sR0FBRyxHQUFHLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFFdkQsaUVBQWlFO1FBQ2pFLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxVQUFVLENBQUMsaUJBQWlCLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDM0UsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7Q0FDRjtBQS9CRCxvQ0ErQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBJbXBvcnQgcmVxdWlyZWQgQ0RLIGFuZCBBV1MgbGlicmFyaWVzXHJcbmltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7IC8vIGNvcmUgQVdTIENESyBmdW5jdGlvbmFsaXR5XHJcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnOyAvLyBiYXNlIGNsYXNzIGZvciBkZWZpbmluZyBBV1MgY29tcG9uZW50c1xyXG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7IC8vIHRvIGRlZmluZSBMYW1iZGEgZnVuY3Rpb25zXHJcbmltcG9ydCAqIGFzIHMzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMyc7IC8vIHRvIGNyZWF0ZSBhbmQgbWFuYWdlIFMzIGJ1Y2tldHNcclxuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSc7IC8vIHRvIGNyZWF0ZSBSRVNUIEFQSXNcclxuXHJcbi8vIERlZmluZSBhIG5ldyBDREsgc3RhY2sgY2FsbGVkIFJlcGxhY2VTdGFja1xyXG5leHBvcnQgY2xhc3MgUmVwbGFjZVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcclxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XHJcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcclxuXHJcbiAgICAvLyBTdGVwIDE6IENyZWF0ZSBhIG5ldyBTMyBidWNrZXQgd2hlcmUgZmlsZXMgd2lsbCBiZSB1cGxvYWRlZCBvciByZXBsYWNlZFxyXG4gICAgY29uc3QgdXBsb2FkQnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCAnVXBsb2FkQnVja2V0Jywge1xyXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLCAvLyBkZWxldGVzIHRoZSBidWNrZXQgd2hlbiBzdGFjayBpcyBkZXN0cm95ZWQgKGZvciBkZXYgb25seSlcclxuICAgICAgYXV0b0RlbGV0ZU9iamVjdHM6IHRydWUgLy8gYWxsb3dzIENESyB0byBkZWxldGUgZmlsZXMgaW5zaWRlIGJlZm9yZSBkZXN0cm95aW5nIGJ1Y2tldFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU3RlcCAyOiBDcmVhdGUgYSBMYW1iZGEgZnVuY3Rpb24gdG8gaGFuZGxlIHRoZSBcInJlcGxhY2VcIiBsb2dpY1xyXG4gICAgY29uc3QgcmVwbGFjZUxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1JlcGxhY2VGdW5jdGlvbicsIHtcclxuICAgICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcclxuICAgICAgICAvLyBDaG9vc2UgTm9kZS5qcyBhcyB0aGUgcnVudGltZVxyXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsIC8vIFRoZSBlbnRyeSBwb2ludCBpbnNpZGUgdGhlIExhbWJkYSBmaWxlIChpbmRleC5qcylcclxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCdsYW1iZGEvcmVwbGFjZScpLCAvLyBGb2xkZXIgcGF0aCB3aGVyZSB5b3VyIExhbWJkYSBjb2RlIGlzIGxvY2F0ZWRcclxuICAgICAgZW52aXJvbm1lbnQ6IHtcclxuICAgICAgICBCVUNLRVRfTkFNRTogdXBsb2FkQnVja2V0LmJ1Y2tldE5hbWUgLy8gUGFzcyB0aGUgYnVja2V0IG5hbWUgYXMgYW4gZW52aXJvbm1lbnQgdmFyaWFibGUgdG8gTGFtYmRhXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFN0ZXAgMzogR2l2ZSBMYW1iZGEgcGVybWlzc2lvbiB0byByZWFkIGFuZCB3cml0ZSB0byB0aGUgUzMgYnVja2V0XHJcbiAgICB1cGxvYWRCdWNrZXQuZ3JhbnRSZWFkV3JpdGUocmVwbGFjZUxhbWJkYSk7XHJcblxyXG4gICAgLy8gU3RlcCA0OiBDcmVhdGUgYSBuZXcgUkVTVCBBUEkgR2F0ZXdheSB0byBleHBvc2UgdGhlIExhbWJkYSBmdW5jdGlvbiBhcyBhbiBlbmRwb2ludFxyXG4gICAgY29uc3QgYXBpID0gbmV3IGFwaWdhdGV3YXkuUmVzdEFwaSh0aGlzLCAnUmVwbGFjZUFwaScpO1xyXG5cclxuICAgIC8vIFN0ZXAgNTogTGluayB0aGUgUE9TVCAvcmVwbGFjZSBlbmRwb2ludCB0byB0aGUgTGFtYmRhIGZ1bmN0aW9uXHJcbiAgICBjb25zdCByZXBsYWNlSW50ZWdyYXRpb24gPSBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihyZXBsYWNlTGFtYmRhKTtcclxuICAgIGFwaS5yb290LmFkZFJlc291cmNlKCdyZXBsYWNlJykuYWRkTWV0aG9kKCdQT1NUJywgcmVwbGFjZUludGVncmF0aW9uKTtcclxuICB9XHJcbn1cclxuIl19