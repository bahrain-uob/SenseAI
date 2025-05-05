const { SageMakerClient, CreateProcessingJobCommand } = require("@aws-sdk/client-sagemaker");
const client = new SageMakerClient();

exports.handler = async () => {
  const s3InputBucket = process.env.INPUT_S3_URI;
  const s3OutputUri = process.env.OUTPUT_S3_URI;
  const sagemakerRoleArn = process.env.SAGEMAKER_ROLE_ARN;
  const imageUri = process.env.IMAGE_URI;
  const fileName = "sample.csv";

  const params = {
    ProcessingJobName: `PreprocessingJob-${Date.now()}`,
    ProcessingResources: {
      ClusterConfig: {
        InstanceCount: 1,
        InstanceType: "ml.m5.large", // or another type your account supports
        VolumeSizeInGB: 30
      }
    },
    AppSpecification: {
      ImageUri: imageUri
    },
    RoleArn: sagemakerRoleArn,
    ProcessingInputs: [
      {
        InputName: "input-data",
        S3Input: {
          S3Uri: `s3://${s3InputBucket}/${fileName}`,
          LocalPath: "/opt/ml/input/data",
          S3DataType: "S3Prefix",
          S3InputMode: "File",
          S3DataDistributionType: "FullyReplicated"
        }
      }
    ],
    ProcessingOutputConfig: {
      Outputs: [
        {
          OutputName: "output-data",
          S3Output: {
            S3Uri: s3OutputUri,
            LocalPath: "/opt/ml/output/data",
            S3UploadMode: "EndOfJob"
          }
        }
      ]
    }
  };

  try {
    const command = new CreateProcessingJobCommand(params);
    const response = await client.send(command);
    console.log("✅ SageMaker Job started:", response);
  } catch (err) {
    console.error("❌ Failed to start job:", err);
    throw err;
  }
};

