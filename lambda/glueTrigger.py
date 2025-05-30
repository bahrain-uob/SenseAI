import boto3
import os

def handler(event, context):
    glue = boto3.client('glue')
    job_name = os.environ['GLUE_JOB_NAME']
    response = glue.start_job_run(JobName=job_name)
    print(f"Glue job {job_name} started: {response['JobRunId']}")
