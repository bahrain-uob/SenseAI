""" import json
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

 """
import json
import os
import boto3
import base64
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()

# Initialize Bedrock Agent Runtime client
bedrock_runtime = boto3.client("bedrock-agent-runtime")

# Environment variables
KNOWLEDGE_BASE_ID = os.environ.get("KNOWLEDGE_BASE_ID", "FAIIYRNX5D")
MODEL_ARN = os.environ.get(
    "MODEL_ARN",
    "arn:aws:bedrock:me-south-1::foundation-model/mistral.mixtral-8x7b-instruct-v0:1"
)

def lambda_handler(event, context):
    logger.info("Lambda invoked with event: %s", json.dumps(event))

    try:
        # Step 1: Extract body
        body_raw = event.get("body", "{}")

        # Step 2: Decode if body is base64-encoded
        if event.get("isBase64Encoded", False):
            logger.info("Decoding base64-encoded body")
            body_raw = base64.b64decode(body_raw).decode("utf-8")

        # Step 3: Parse body JSON
        body = json.loads(body_raw)
        question = body.get("question")
        logger.info(f"Parsed question: {question}")

        if not question:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing 'question' in request body"})
            }

        # Step 4: Call Bedrock RetrieveAndGenerate
        logger.info("Calling Bedrock RetrieveAndGenerate API...")
        response = bedrock_runtime.retrieve_and_generate(
            input={"text": question},
            retrieveAndGenerateConfiguration={
                "type": "KNOWLEDGE_BASE",
                "knowledgeBaseConfiguration": {
                    "knowledgeBaseId": KNOWLEDGE_BASE_ID,
                    "modelArn": MODEL_ARN
                }
            }
        )

        answer = response["output"]["text"]
        logger.info(f"Answer from model: {answer}")

        # Step 5: Return the response
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            "body": json.dumps({"answer": answer})
        }

    except Exception as e:
        logger.exception("An error occurred during Lambda execution")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
