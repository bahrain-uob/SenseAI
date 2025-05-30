import * as cdk from "aws-cdk-lib";
import { MyCdkStack } from "../lib/my-cdk-app-stack";
import { DBStack } from "../lib/DBstack"; // Import your DBStack
import { APIStack } from "../lib/api-stack"; // Import your APIStack
import { CdkBedrockChatbotStack } from "../lib/cdk-bedrock-chatbot-stack";
import { SagemakerStack } from "../lib/sagemaker-stack";
import { ReplaceStack } from "../lib/replace-stack";
import { AnomalyStack } from '../lib/anomaly-stack';
import { PreprocessingStack } from '../lib/preprocessing-stack';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as s3 from "aws-cdk-lib/aws-s3";

const app = new cdk.App();

// Create the DBStack
const dbStack = new DBStack(app, "DBStack", {
  // Any custom stack props you may have for DBStack
});
const MyCdkAppStack = new MyCdkStack(app, "MyCdkAppStack",dbStack.TransRawTable2);
/* const MyCdkAppStack = new MyCdkStack(app, "MyCdkAppStack", undefined as any); */

// Create the APIStack, passing in the DBStack as a dependency
const apistack= new APIStack(app, "APIStack", dbStack, MyCdkAppStack.TransactionUploadsBucket,MyCdkAppStack.uploadobjBucket); 




// Pass the DBStack as the second argument


new CdkBedrockChatbotStack(app, 'CdkBedrockChatbotStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'eu-west-1', // 👈 Set region to Ireland explicitly
  },
});
/* // Optionally, you can create your other stacks here if needed
new MyCdkStack(app, "MyCdkAppStack");

const { AuthStack } = require('../lib/auth-stack');

new AuthStack(app, 'SenseAI-Auth');

new SagemakerStack(app, "SagemakerStack");

new ReplaceStack(app, 'ReplaceStack');

new AnomalyStack(app, 'AnomalyStack');

new PreprocessingStack(app, 'PreprocessingStack');
*/
