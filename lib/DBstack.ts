import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { RemovalPolicy } from "aws-cdk-lib";

export class DBStack extends cdk.Stack {
  public readonly casesTable: dynamodb.Table;
  public readonly activityTable: dynamodb.Table;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Existing table for cases
    this.casesTable = new dynamodb.Table(this, "SensAI-Customs", {
      tableName: "CasesTable",
      partitionKey: { name: "TransactionID", type: dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // ew table for employee activity logs
    this.activityTable = new dynamodb.Table(this, "EmployeeActivityTable", {
      tableName: "EmployeeActivity",
      partitionKey: { name: "employee", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "timestamp", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}
