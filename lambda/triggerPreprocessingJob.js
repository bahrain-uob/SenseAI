/* const AWS = require('aws-sdk');
const sagemaker = new AWS.SageMaker();

exports.handler = async (event) => {
    console.log("Event:", JSON.stringify(event));

    const s3InputURI = process.env.INPUT_S3_URI;
    const s3OutputURI = process.env.OUTPUT_S3_URI;
    const sagemakerRoleArn = process.env.SAGEMAKER_ROLE_ARN;
    const imageUri = process.env.IMAGE_URI;

    // Get the file name from the event
    const fileName = event.Records[0].s3.object.key;

    // Prepare SageMaker processing job
    const processingJobParams = {
        ProcessingJobName: `PreprocessingJob-${Date.now()}`,
        ProcessingInputs: [
            {
                InputName: 'input-data',
                S3Input: {
                    S3Uri: `s3://${s3InputURI}/${fileName}`,
                    LocalPath: '/opt/ml/input/data',
                    S3DataType: 'S3Prefix',
                    S3InputMode: 'File',
                    S3DataDistributionType: 'FullyReplicated'
                }
            }
        ],
        ProcessingOutputConfig: {
            Outputs: [
                {
                    OutputName: 'output-data',
                    S3Output: {
                        S3Uri: `s3://${s3OutputURI}`,
                        LocalPath: '/opt/ml/output/data',
                        S3UploadMode: 'EndOfJob'
                    }
                }
            ]
        },
        AppSpecification: {
            ImageUri: imageUri
        },
        RoleArn: sagemakerRoleArn
    };

    try {
        // Start the SageMaker processing job
        const result = await sagemaker.createProcessingJob(processingJobParams).promise();
        console.log("SageMaker Processing Job Started:", result);
    } catch (error) {
        console.error("Error starting SageMaker job:", error);
        throw error;
    }
};
 */

const AWS = require('aws-sdk');
const sagemaker = new AWS.SageMaker();

exports.handler = async (event) => {
    console.log("Event:", JSON.stringify(event));

    const s3InputURI = process.env.INPUT_S3_URI;
    const s3OutputURI = process.env.OUTPUT_S3_URI;
    const sagemakerRoleArn = process.env.SAGEMAKER_ROLE_ARN;
    const imageUri = process.env.IMAGE_URI;

    // Get the file name from the event
    const fileName = event.Records[0].s3.object.key;

    // Prepare SageMaker processing job
    const processingJobParams = {
        ProcessingJobName: `PreprocessingJob-${Date.now()}`,
        ProcessingInputs: [
            {
                InputName: 'input-data',
                S3Input: {
                    S3Uri: `s3://${s3InputURI}/${fileName}`,
                    LocalPath: '/opt/ml/input/data',
                    S3DataType: 'S3Prefix',
                    S3InputMode: 'File',
                    S3DataDistributionType: 'FullyReplicated'
                }
            }
        ],
        ProcessingOutputConfig: {
            Outputs: [
                {
                    OutputName: 'output-data',
                    S3Output: {
                        S3Uri: `s3://${s3OutputURI}/prefinal-output/`, // Saving to prefinal-output folder
                        LocalPath: '/opt/ml/output/data',
                        S3UploadMode: 'EndOfJob'
                    }
                }
            ]
        },
        AppSpecification: {
            ImageUri: imageUri
        },
        RoleArn: sagemakerRoleArn
    };

    try {
        // Start the SageMaker processing job
        const result = await sagemaker.createProcessingJob(processingJobParams).promise();
        console.log("SageMaker Processing Job Started:", result);
    } catch (error) {
        console.error("Error starting SageMaker job:", error);
        throw error;
    }
};
