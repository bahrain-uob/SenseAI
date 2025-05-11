import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { RemovalPolicy } from "aws-cdk-lib";

export class DBStack extends cdk.Stack {
  public readonly casesTable: dynamodb.Table;
  public readonly activityTable: dynamodb.Table;
  public readonly rawTransTable: dynamodb.Table;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Existing table for cases (KEEP ORIGINAL NAME - DO NOT RENAME)
    this.casesTable = new dynamodb.Table(this, "SensAI-Customs", {
      partitionKey: { name: "TransactionID", type: dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // New table for employee activity logs
    this.activityTable = new dynamodb.Table(this, "EmployeeActivityTable", {
      tableName: "EmployeeActivity",
      partitionKey: { name: "EmployeeName", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "Timestamp", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.rawTransTable = new dynamodb.Table(this, 'RawTransTable', {
      tableName: 'RawTrans',
      partitionKey: {
        name: 'INDEX',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // change to RETAIN for production
    });
  }
}
