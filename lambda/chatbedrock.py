import boto3
import os
import json

# Initialize the Bedrock Agents client in the correct region
bedrock_agent = boto3.client("bedrock-agent-runtime", region_name="eu-west-1")

def handler(event, context):
    """
    Lambda handler to:
      • Validate incoming JSON with a 'question' field
      • Query a Bedrock knowledge base (RAG)
      • Return the generated answer plus any citations
    """
    try:
        # Reject requests with no body
        if event.get('body') is None:
            return {
                "statusCode": 400,
                "body": json.dumps({"message": "Request body is missing"})
            }

        # Parse JSON and extract question
        body = json.loads(event['body'])
        question = body.get("question")
        if not question:
            return {
                "statusCode": 400,
                "body": json.dumps({"message": "Question field is missing in the body"})
            }

        # Load knowledge-base ID from environment
        knowledge_base_id = os.environ.get("KNOWLEDGE_BASE_ID")
        if not knowledge_base_id:
            return {
                "statusCode": 500,
                "body": json.dumps({"message": "Missing KNOWLEDGE_BASE_ID environment variable"})
            }

        # Define the model ARN
        model_arn = "arn:aws:bedrock:eu-west-1:166555558375:inference-profile/eu.amazon.nova-pro-v1:0"

        # Call the RAG API with corrected configuration
        response = bedrock_agent.retrieve_and_generate(
            input={"text": question},
            retrieveAndGenerateConfiguration={
                "type": "KNOWLEDGE_BASE",
                "knowledgeBaseConfiguration": {
                    "knowledgeBaseId": knowledge_base_id,
                    "modelArn": model_arn,
                    "retrievalConfiguration": {
                        "vectorSearchConfiguration": {
                            "numberOfResults": 3
                        }
                    },
                    "orchestrationConfiguration": {
                        "promptTemplate": {
                            "textPromptTemplate": (
                                "You are a customs policy assistant for Bahrain Customs Affairs.\n\n"
                                "Your job is to answer questions about regulations, procedures, and transaction policies using only the information in the context provided.  You may add brief, valuable related details only if they are factually accurate and directly relevant.\n\nLanguage Policy / سياسة اللغة:\n\n- If the user's question is in Arabic, you must answer in Arabic.  \n  إذا كان سؤال المستخدم باللغة العربية، يجب أن تكون الإجابة باللغة العربية فقط.\n\n- If the user's question is in English, you must answer in English.  \n  إذا كان السؤال باللغة الإنجليزية، أجب باللغة الإنجليزية فقط.\n\n- If the relevant context is in Arabic, respond in Arabic — even if the question is in English.  \n  إذا كان السياق المعروض باللغة العربية، أجب باللغة العربية.\n\n- If the relevant context is in English, respond in English — unless the user's question is in Arabic.\n\nDo not mix Arabic and English in one answer.  \nلا تخلط بين اللغتين في إجابة واحدة.  \nAlways match the language of the question or the document context.  \nحافظ على نفس لغة السؤال أو المصدر في الإجابة.\n\nIf no answer is found in the context and no related knowledge applies, respond with:  \n\"عذرًا، لا تتوفر لدينا معلومات كافية للإجابة على هذا السؤال.\"  \nor  \n\"Sorry, there is not enough information available to answer this question.\"\n\nKeep your tone professional, clear, and concise.  \nكن رسميًا وواضحًا وموجزًا في إجاباتك.\n\nContext:\n{{context}}\n\nQuestion:\n{{input}}\n\nAnswer:"

                                 "Below is the conversation history and retrieved information to guide your response.\n\n"
                                "Conversation History:\n$conversation_history$\n\n"
                                "Retrieved Information:\n$search_results$\n\n"
                                "Query: $query$\n\n"
                                "Provide a concise and accurate answer in the following format:\n$output_format_instructions$"
                            )
                        }
                    },
                    "generationConfiguration": {
                        "inferenceConfig": {
                            "textInferenceConfig": {
                                "maxTokens": 512,
                                "temperature": 0.7
                            }
                        },
                        "promptTemplate": {
                            "textPromptTemplate": (
                                "Based on the following context, answer the query.\n\n"
                                "$search_results$\n\n"
                                "Query: $query$\n\n"
                                "Answer:"
                            )
                        }
                    }
                }
            }
        )

        # Build a 200 response with the model’s answer and any citations
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "http://localhost:3000"
            },
            "body": json.dumps({
                "answer": response['output']['text'],
                "sources": response.get('citations', [])
            })
        }

    except json.JSONDecodeError:
        # Handle invalid JSON in the request
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "Invalid JSON format"})
        }

    except KeyError as e:
        # Handle unexpected response structure
        return {
            "statusCode": 500,
            "body": json.dumps({"message": f"Missing key in the response: {e}"})
        }

    except Exception as e:
        # Catch-all for any other errors
        return {
            "statusCode": 500,
            "body": json.dumps({"message": f"Internal server error: {e}"})
        }