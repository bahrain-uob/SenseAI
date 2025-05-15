""" import boto3
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
            "Access-Control-Allow-Origin": "http://localhost:3000"
        },
        "body": json.dumps({
            "answer": response['output']['text'],
            "sources": response.get('citations', [])
        })
    }
 """

""" import boto3
import os
import json

bedrock_agent = boto3.client("bedrock-agent-runtime", region_name="eu-west-1")

def handler(event, context):
    try:
        # Check if the body exists and is not None
        if event.get('body') is None:
            return {
                "statusCode": 400,
                "body": json.dumps({"message": "Request body is missing"})
            }
        
        # Parse the JSON body
        body = json.loads(event['body'])
        
        # Extract the question from the body
        question = body.get("question")
        
        if not question:
            return {
                "statusCode": 400,
                "body": json.dumps({"message": "Question field is missing in the body"})
            }
        print("KnowledgeBaseId:", os.environ.get('FAIIYRNX5D'))
        # Call the Bedrock Agent
        
        knowledge_base_id = os.environ.get("KNOWLEDGE_BASE_ID")

        # ✅ Moves generationConfiguration to the correct level
        response = bedrock_agent.retrieve_and_generate(
            input={"text": question},
            retrieveAndGenerateConfiguration={
                "type": "KNOWLEDGE_BASE",
                "knowledgeBaseConfiguration": {
                    "knowledgeBaseId": knowledge_base_id,
                    "retrievalConfiguration": {
                        "vectorSearchConfiguration": {
                            "numberOfResults": 3
                        }
                    }
                }
            },
            generationConfiguration={  # ✅ This must be a top-level argument
                "modelArn": "arn:aws:bedrock:eu-west-1::foundation-model/mistral.mixtral-8x7b-instruct-v0:1",
                "temperature": 0.3,
                "topP": 0.9,
                "maxTokens": 1024
            }
        )

        # Return the response with the generated answer
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
        # Handle invalid JSON
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "Invalid JSON format"})
        }
    
    except KeyError as e:
        # Handle missing keys in the response
        return {
            "statusCode": 500,
            "body": json.dumps({"message": f"Missing key in the response: {str(e)}"})
        }
    
    except Exception as e:
        # Catch any other errors and return a 500 response
        return {
            "statusCode": 500,
            "body": json.dumps({"message": f"Internal server error: {str(e)}"})
        }
 """

""" import boto3
import os
import json

bedrock_agent = boto3.client("bedrock-agent-runtime", region_name="eu-west-1")

def handler(event, context):
    try:
        if event.get('body') is None:
            return {
                "statusCode": 400,
                "body": json.dumps({"message": "Request body is missing"})
            }

        body = json.loads(event['body'])
        question = body.get("question")

        if not question:
            return {
                "statusCode": 400,
                "body": json.dumps({"message": "Question field is missing in the body"})
            }

        knowledge_base_id = os.environ.get("KNOWLEDGE_BASE_ID")
        model_arn = "arn:aws:bedrock:eu-west-1::foundation-model/mistral.mixtral-8x7b-instruct-v0:1"

        if not knowledge_base_id:
            return {
                "statusCode": 500,
                "body": json.dumps({"message": "Missing KNOWLEDGE_BASE_ID environment variable"})
            }

        response = bedrock_agent.retrieve_and_generate(
        input={"text": question},
        retrieveAndGenerateConfiguration={
            "type": "KNOWLEDGE_BASE",
            "knowledgeBaseConfiguration": {
                "knowledgeBaseId": os.environ.get("FAIIYRNX5D"),
                "modelArn": "arn:aws:bedrock:eu-west-1::foundation-model/mistral.mixtral-8x7b-instruct-v0:1",
                "retrievalConfiguration": {
                    "vectorSearchConfiguration": {
                        "numberOfResults": 3
                    }
                },
                "promptConfiguration": {
                    "promptTemplate": {
                        "textPromptTemplate": (
                            "Answer the following question based on the context.\n\n"
                            "Context:\n{{context}}\n\n"
                            "Question:\n{{input}}\n\n"
                            "Answer:"
                        )
                    }
                }
            }
        }
    )


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
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "Invalid JSON format"})
        }

    except KeyError as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": f"Missing key in the response: {str(e)}"})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": f"Internal server error: {str(e)}"})
        }
 """

""" import boto3
import os
import json

# 1. Initialize the Bedrock Agents client in the correct region
bedrock_agent = boto3.client("bedrock-agent-runtime", region_name="eu-west-1")

def handler(event, context):
    try:
        # 2. Reject requests with no body
        if event.get('body') is None:
            return {
                "statusCode": 400,
                "body": json.dumps({"message": "Request body is missing"})
            }

        # 3. Parse JSON and extract question
        body = json.loads(event['body'])
        question = body.get("question")
        if not question:
            return {
                "statusCode": 400,
                "body": json.dumps({"message": "Question field is missing in the body"})
            }

        # 4. Load your knowledge-base ID and (optionally) model ARN from environment
        knowledge_base_id = os.environ.get("KNOWLEDGE_BASE_ID")
        if not knowledge_base_id:
            return {
                "statusCode": 500,
                "body": json.dumps({"message": "Missing KNOWLEDGE_BASE_ID environment variable"})
            }

        # You defined this earlier—let’s actually use it below instead of hard-coding twice
        model_arn = "arn:aws:bedrock:eu-west-1::foundation-model/mistral.mixtral-8x7b-instruct-v0:1"

        # 5. Call the RAG API correctly:
        #    • Use the KB ID you loaded (instead of os.environ.get("FAIIYRNX5D"))
        #    • Put your prompt override under `generationConfiguration.promptTemplate`
        #    • Do NOT use `promptConfiguration` (that’s not in the spec)
        response = bedrock_agent.retrieve_and_generate(
            input={ "text": question },
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
                },
                "generationConfiguration": {
                    "promptTemplate": {
                        "textPromptTemplate": (
                            "Answer the following question based on the context.\n\n"
                            "$search_results$\n\n"
                            "Question:\n{{input}}\n\n"
                            "Answer:"
                        )
                    }
                },
                "orchestrationPromptTemplate": {
                    "textPromptTemplate": (
                        "Use the following search results to help answer the question.\n\n"
                        "$search_results$\n\n"
                        "User question:\n{{input}}\n\n"
                        "Generate a helpful answer."
                    )
                }
            }

        )

        # 6. Build a 200 response with the model’s answer and any citations
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
        # Catch‐all for any other errors
        return {
            "statusCode": 500,
            "body": json.dumps({"message": f"Internal server error: {e}"})
        } """
    

""" import boto3
import os
import json

# Initialize the Bedrock Agents client in the correct region
bedrock_agent = boto3.client("bedrock-agent-runtime", region_name="eu-west-1")

def handler(event, context):
   
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
        model_arn = "arn:aws:bedrock:eu-west-1::foundation-model/mistral.mixtral-8x7b-instruct-v0:1"

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
                    "generationConfiguration": {
                        "inferenceConfig": {
                            "textInferenceConfig": {
                                "maxTokens": 512,
                                "temperature": 0.7
                            }
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
 """
""" 
import boto3
import os
import json

# Initialize the Bedrock Agents client in the correct region
bedrock_agent = boto3.client("bedrock-agent-runtime", region_name="eu-west-1")

def handler(event, context):
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
        model_arn = "arn:aws:bedrock:eu-west-1::foundation-model/mistral.mixtral-8x7b-instruct-v0:1"

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
                        "queryTransformationConfiguration": {
                            "type": "QUERY_DECOMPOSITION"
                        },
                        "promptTemplate": {
                            "textPromptTemplate": (
                                "You are an assistant that answers questions based on provided context. "
                                "Use the following retrieved information to answer the question accurately.\n\n"
                                "$search_results$\n\n"
                                "Question: {{input}}\n\n"
                                "Provide a concise and accurate answer."
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
                                "Based on the following context, answer the question.\n\n"
                                "$search_results$\n\n"
                                "Question: {{input}}\n\n"
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
        } """


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
        model_arn = "arn:aws:bedrock:eu-west-1::foundation-model/mistral.mixtral-8x7b-instruct-v0:1"

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
                                "You are an assistant that answers questions based on provided context. "
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