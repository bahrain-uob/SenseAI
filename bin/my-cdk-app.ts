import * as cdk from "aws-cdk-lib";
import { MyCdkStack } from "../lib/my-cdk-app-stack";
import { DBStack } from "../lib/DBstack"; // Import your DBStack
import { APIStack } from "../lib/api-stack"; // Import your APIStack
import { SagemakerStack } from "../lib/sagemaker-stack";
import { ReplaceStack } from "../lib/replace-stack";
import { AnomalyStack } from '../lib/anomaly-stack';
import { PreprocessingStack } from '../lib/preprocessing-stack';
const app = new cdk.App();

// Create the DBStack
const dbStack = new DBStack(app, "DBStack", {
  // Any custom stack props you may have for DBStack
});
const MyCdkAppStack = new MyCdkStack(app, "MyCdkAppStack");

// Create the APIStack, passing in the DBStack as a dependency
new APIStack(app, "APIStack", dbStack, MyCdkAppStack.TransactionUploadsBucket,MyCdkAppStack.uploadobjBucket); // Pass the DBStack as the second argument

/* // Optionally, you can create your other stacks here if needed
new MyCdkStack(app, "MyCdkAppStack");

const { AuthStack } = require('../lib/auth-stack');

new AuthStack(app, 'SenseAI-Auth');

new SagemakerStack(app, "SagemakerStack");

new ReplaceStack(app, 'ReplaceStack');

new AnomalyStack(app, 'AnomalyStack');

new PreprocessingStack(app, 'PreprocessingStack');
*/
