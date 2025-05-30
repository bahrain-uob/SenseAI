import sys
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.utils import getResolvedOptions
from awsglue.job import Job

args = getResolvedOptions(sys.argv, ['JOB_NAME', 'S3_PATH','DDB_TABLE'])
s3_path = args['S3_PATH']
ddb_table = args['DDB_TABLE']

sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

# Use the dynamic S3 path
input_data = glueContext.create_dynamic_frame.from_options(
    connection_type="s3",
    format="excel",
    connection_options={
        "paths": [s3_path],
        "recurse": True
    }
)

glueContext.write_dynamic_frame.from_options(
    frame=input_data,
    connection_type="dynamodb",
    connection_options={
        "dynamodb.output.tableName": "ddb_table",
        "dynamodb.throughput.write.percent": "1.0"
    }
)

job.commit()
