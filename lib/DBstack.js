"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBStack = void 0;
const cdk = require("aws-cdk-lib");
const dynamodb = require("aws-cdk-lib/aws-dynamodb");
const aws_cdk_lib_1 = require("aws-cdk-lib");
class DBStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // Create DynamoDB Table for cases
        this.casesTable = new dynamodb.Table(this, "[ChallengeName]CaseHistory", {
            partitionKey: { name: "caseID", type: dynamodb.AttributeType.STRING },
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY, // Ensure table is deleted during stack removal
        });
    }
}
exports.DBStack = DBStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiREJzdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkRCc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLHFEQUFxRDtBQUNyRCw2Q0FBNEM7QUFFNUMsTUFBYSxPQUFRLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFHcEMsWUFBWSxLQUFjLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzVELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLGtDQUFrQztRQUNsQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsNEJBQTRCLEVBQUU7WUFDdkUsWUFBWSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUU7WUFDckUsYUFBYSxFQUFFLDJCQUFhLENBQUMsT0FBTyxFQUFFLCtDQUErQztTQUN0RixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFaRCwwQkFZQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiYXdzLWNkay1saWJcIjtcclxuaW1wb3J0ICogYXMgZHluYW1vZGIgZnJvbSBcImF3cy1jZGstbGliL2F3cy1keW5hbW9kYlwiO1xyXG5pbXBvcnQgeyBSZW1vdmFsUG9saWN5IH0gZnJvbSBcImF3cy1jZGstbGliXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgREJTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XHJcbiAgcHVibGljIHJlYWRvbmx5IGNhc2VzVGFibGU6IGR5bmFtb2RiLlRhYmxlO1xyXG5cclxuICBjb25zdHJ1Y3RvcihzY29wZTogY2RrLkFwcCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xyXG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIER5bmFtb0RCIFRhYmxlIGZvciBjYXNlc1xyXG4gICAgdGhpcy5jYXNlc1RhYmxlID0gbmV3IGR5bmFtb2RiLlRhYmxlKHRoaXMsIFwiW0NoYWxsZW5nZU5hbWVdQ2FzZUhpc3RvcnlcIiwge1xyXG4gICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogXCJjYXNlSURcIiwgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcclxuICAgICAgcmVtb3ZhbFBvbGljeTogUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLCAvLyBFbnN1cmUgdGFibGUgaXMgZGVsZXRlZCBkdXJpbmcgc3RhY2sgcmVtb3ZhbFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcbiJdfQ==