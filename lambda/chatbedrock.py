""" import boto3
import os
import json

bedrock_agent = boto3.client("bedrock-agent-runtime", region_name="eu-west-1")

def handler(event, context):
    body = json.loads(event['body'])
    question = body.get("question", "").strip()

    if not question:
        return {
            "statusCode": 400,
            "body": json.dumps({ "error": "Missing or empty question." })
        }

    # Custom bilingual prompt for controlled answer generation
    instruction = """
أنت مساعد للإجابة على الأسئلة المتعلقة بشئون الجمارك في مملكة البحرين. سيتم تزويدك بنتائج بحث من قاعدة المعرفة الرسمية للجمارك. استخدم فقط هذه النتائج للإجابة على سؤال المستخدم.

- إذا كان السؤال باللغة العربية، يجب أن تكون الإجابة باللغة العربية فقط.
- إذا كان السؤال باللغة الإنجليزية، يجب أن تكون الإجابة باللغة الإنجليزية فقط.
- لا تخلط بين اللغتين في نفس الإجابة.

اعتمد فقط على المعلومات الموجودة في نتائج البحث. لا تضف افتراضات خارجية أو معلومات غير موجودة في السياق. إذا لم تجد معلومات كافية للإجابة على السؤال، يجب أن تصرح بأنك لم تتمكن من العثور على إجابة دقيقة.

You are a question answering agent for Bahrain Customs Affairs. You will be provided with a set of search results from the official customs knowledge base. Use only these results to answer the user's question.

- If the question is in Arabic, respond only in Arabic.
- If the question is in English, respond only in English.
- Do not mix languages in your response.

Strictly base your answer on the content of the search results. Do not invent answers or assume facts not in the context. If the search results do not contain the information needed to answer the question, clearly state that you could not find an exact answer.

Here are the search results in numbered order:
$search_results$

$output_format_instructions$

Here is the user's query:
$query$
""".strip()

    response = bedrock_agent.retrieve_and_generate(
        input={"text": instruction},
        knowledgeBaseId=os.environ['FAIIYRNX5D'],
        retrievalConfiguration={
            "vectorSearchConfiguration": {
                "numberOfResults": 3
            }
        },
        generationConfiguration={
            "modelArn": "arn:aws:bedrock:eu-west-1::foundation-model/amazon.nova-pro-v1:0",
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