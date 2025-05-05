import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class AnomalyStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = s3.Bucket.fromBucketName(this, 'ProcessedDatasetBucket', 'senseai-processed-transactions-dataset-hj20250426');

    const anomalyFn = new lambda.Function(this, 'AnomalyDetectionTrigger', {
      runtime: lambda.Runtime.NODEJS_18_X,  
      handler: 'anomalyTrigger.handler',   //  this matches `anomalyTrigger.js` + `exports.handler`
      code: lambda.Code.fromAsset('lambda'),  //  this folder contains `anomalyTrigger.js`
      environment: {
        BUCKET_NAME: bucket.bucketName,
      }
    });

    bucket.grantRead(anomalyFn);
  }
}


