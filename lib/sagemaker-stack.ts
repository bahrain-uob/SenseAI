import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sagemaker from 'aws-cdk-lib/aws-sagemaker';
import * as iam from 'aws-cdk-lib/aws-iam';

export class SagemakerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 BUCKET FOR RAW DATASETS 
    const dataBucket = new s3.Bucket(this, 'RawDataBucket', {
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      lifecycleRules: [
        {
          id: 'TransitionToStandardIA',
          enabled: true,
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(30),
            },
          ],
        },
      ],      
    });
    

    // IAM ROLE FOR SAGEMAKER NOTEBOOK 
    const sagemakerExecutionRole = new iam.Role(this, 'SagemakerExecutionRole', {
      assumedBy: new iam.ServicePrincipal('sagemaker.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSageMakerFullAccess'),
      ],
    });

    // SAGEMAKER NOTEBOOK INSTANCE
    const notebookInstance = new sagemaker.CfnNotebookInstance(this, 'SenseAINotebook', {
      instanceType: 'ml.t3.medium', //for testing
      roleArn: sagemakerExecutionRole.roleArn,
      notebookInstanceName: 'SenseAI-Notebook',
      directInternetAccess: 'Enabled',
      volumeSizeInGb: 10,
      rootAccess: 'Enabled',
      // defaultCodeRepository: '', // Add later if needed
    });

    // OUTPUTS
    new cdk.CfnOutput(this, 'RawDataBucketName', {
      value: dataBucket.bucketName,
      description: 'S3 bucket for raw datasets',
    });

    new cdk.CfnOutput(this, 'NotebookInstanceName', {
      value: notebookInstance.notebookInstanceName!,
      description: 'SageMaker Notebook Instance Name',
    });
  }
}
