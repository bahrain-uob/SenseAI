import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { RemovalPolicy } from "aws-cdk-lib";

export class DBStack extends cdk.Stack {
  public readonly casesTable: dynamodb.Table;
  public readonly activityTable: dynamodb.Table;
  public readonly TransRawTable : dynamodb.Table;
  public readonly TransRawTable2 : dynamodb.Table;
  public readonly TransRawTable3 : dynamodb.Table;

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

    this.TransRawTable = new dynamodb.Table(this, 'TransRaw', {
      tableName: 'TransRaw',
      partitionKey: {
        name: 'rowid',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // change to RETAIN for production
    });

    /* this.TransRawTable = new dynamodb.Table(this, 'TransRaw', {
    tableName: 'TransRaw',
    partitionKey: {
      name: 'Reference Number',
      type: dynamodb.AttributeType.STRING,
    },
    sortKey: {
      name: 'Item Number',
      type: dynamodb.AttributeType.STRING,
    },
    billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    removalPolicy: cdk.RemovalPolicy.DESTROY, // change to RETAIN for production
  }); */

    //table for audit page v2
    this.TransRawTable2 = new dynamodb.Table(this, 'TransRawV2', {
      tableName: 'TransRawV2',
      partitionKey: {
        name: 'rowid',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // change to RETAIN for production
    });

    this.TransRawTable3 = new dynamodb.Table(this, 'TransRawV3', {
    tableName: 'TransRawV3',
    partitionKey: {
      name: 'Reference Number',
      type: dynamodb.AttributeType.STRING,
    },
    sortKey: {
      name: 'Item Number',
      type: dynamodb.AttributeType.STRING,
    },
    billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    removalPolicy: cdk.RemovalPolicy.DESTROY, // change to RETAIN for production
  });

  // Table for audit page v2 with composite key
  /* this.TransRawTable2 = new dynamodb.Table(this, 'TransRawV2', {
    tableName: 'TransRawV2',
    partitionKey: {
      name: 'Reference Number',
      type: dynamodb.AttributeType.STRING,
    },
    sortKey: {
      name: 'Item Number',
      type: dynamodb.AttributeType.STRING,
    },
    billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    removalPolicy: cdk.RemovalPolicy.DESTROY, // change to RETAIN for production
  }); */


   /*  this.RAWTRANSACtion = new dynamodb.Table(this, 'RawTransaTable', {
      tableName: 'RawTrans',
      partitionKey: {
        name: 'rowid',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // change to RETAIN for production
    }); */
  }
}