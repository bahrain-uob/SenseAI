import * as cdk from "aws-cdk-lib";
import { DBStack } from "../lib/DBstack";
import { MyCdkStack } from "../lib/my-cdk-app-stacks";
import { APIStack } from "../lib/api-stack";

const app = new cdk.App();
// First create DB stack
const dbStack = new DBStack(app, "DBStack");

// Then create MyCdkStack and pass dbStack
const MyCdkAppStack = new MyCdkStack(app, "MyCdkAppStacks");

new APIStack(app, 'APIStack', dbStack, MyCdkAppStack.processedBucket, dbStack.casesTable.tableName,MyCdkAppStack.uploadobjBucket);