import boto3
import os
import json

bedrock_agent = boto3.client("bedrock-agent-runtime", region_name="eu-west-1")

def handler(event, context):
    body = json.loads(event['body'])
    question = body.get("question")

    response = bedrock_agent.retrieve_and_generate(
        input={"text": question},
        knowledgeBaseId=os.environ['FAIIYRNX5D'],
        retrievalConfiguration={
            "vectorSearchConfiguration": {
                "numberOfResults": 3
            }
        },
        generationConfiguration={
            "modelArn": "arn:aws:bedrock:eu-west-1::foundation-model/mistral.mixtral-8x7b-instruct-v0:1",
            "temperature": 0.3,
            "topP": 0.9,
            "maxTokens": 1024,
        }
    )

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "https://d10uresn4y47do.cloudfront.net"
        },
        "body": json.dumps({
            "answer": response['output']['text'],
            "sources": response.get('citations', [])
        })
    }
