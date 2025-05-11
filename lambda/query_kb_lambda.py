import json
import boto3
import os
import logging

# Set up logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize Bedrock Agent Runtime client
bedrock_runtime = boto3.client("bedrock-agent-runtime")

# Environment variables
KNOWLEDGE_BASE_ID = os.environ.get("KNOWLEDGE_BASE_ID", "FAIIYRNX5D")
MODEL_ARN = os.environ.get(
    "MODEL_ARN",
    "arn:aws:bedrock:eu-west-1::foundation-model/mistral.mixtral-8x7b-instruct-v0:1"
)

def lambda_handler(event, context):
    logger.info("Lambda invoked")
    print("Received event:", json.dumps(event))  # Visible in CloudWatch and CLI

    try:
        # Parse the body
        body = event.get("body", "{}")
        if isinstance(body, str):
            body = json.loads(body)

        user_question = body.get("question")
        logger.info(f"User question: {user_question}")

        if not user_question:
            logger.warning("No question provided in input.")
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing 'question' in request body"})
            }

        logger.info("Calling Bedrock RetrieveAndGenerate API")
        response = bedrock_runtime.retrieve_and_generate(
            input={"text": user_question},
            retrieveAndGenerateConfiguration={
                "type": "KNOWLEDGE_BASE",
                "knowledgeBaseConfiguration": {
                    "knowledgeBaseId": KNOWLEDGE_BASE_ID,
                    "modelArn": MODEL_ARN
                }
            }
        )

        logger.info("Response from Bedrock received")
        answer = response["output"]["text"]
        print("Generated answer:", answer)

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            "body": json.dumps({"answer": answer})
        }

    except Exception as e:
        logger.error("Exception occurred", exc_info=True)
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
