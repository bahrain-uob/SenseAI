import boto3
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
            "Access-Control-Allow-Origin": "https://d10uresn4y47do.cloudfront.net"
        },
        "body": json.dumps({
            "answer": response['output']['text'],
            "sources": response.get('citations', [])
        })
    }
