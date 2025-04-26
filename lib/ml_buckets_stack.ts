import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class MLBucketsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Processed Dataset Bucket
    const processedDataBucket = new s3.Bucket(this, 'ProcessedTransactionsDatasetBucket', {
      bucketName: 'senseai-processed-transactions-dataset-hj20250426',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: false,
    });

    // ML Results Bucket
    const mlResultsBucket = new s3.Bucket(this, 'SenseAI_MLResultsBucket', {
      bucketName: 'senseai-ml-results-bucket-hj20250426', // change if needed
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: false,
    });
  }
}
