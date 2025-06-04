/* import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class CdkBedrockChatbotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
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


        // Create the API Gateway
            const api = new apigateway.RestApi(this, "chatbot", {
            restApiName: " chatbot Service",
            });



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
  }
} */


import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class CdkBedrockChatbotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const knowledgeBaseArn = "arn:aws:bedrock:*:166555558375:knowledge-base/FAIIYRNX5D"; // Full ARN for your KB
    const modelArn = "arn:aws:bedrock:*:166555558375:inference-profile/eu.amazon.nova-pro-v1:0";

    // Bedrock Lambda function for chatbot
    const chatBedrockLambda = new lambda.Function(this, "ChatBedrockLambda", {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: "chatbedrock.handler", // Path: lambda/chatbedrock.py
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        KNOWLEDGE_BASE_ID: "FAIIYRNX5D",  // ← Replace this if needed
      },
    });

    // Add fine-grained Bedrock permissions
    chatBedrockLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        "bedrock:RetrieveAndGenerate",
        "bedrock:Retrieve",
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream",
        "bedrock:GetInferenceProfile",
      ],
      resources: [
        knowledgeBaseArn
        ,modelArn]
    }));

    // Create the API Gateway
    const api = new apigateway.RestApi(this, "chatbot", {
      restApiName: "chatbot Service",
    });

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
      allowOrigins: ["http://localhost:3000"],
      allowMethods: ["POST", "OPTIONS"],
      allowHeaders: ["Content-Type"]
    });
  }
}