"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnomalyStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const s3 = require("aws-cdk-lib/aws-s3");
class AnomalyStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const bucket = s3.Bucket.fromBucketName(this, 'ProcessedDatasetBucket', 'senseai-processed-transactions-dataset-hj20250426');
        const anomalyFn = new lambda.Function(this, 'AnomalyDetectionTrigger', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'anomalyTrigger.handler', //  this matches `anomalyTrigger.js` + `exports.handler`
            code: lambda.Code.fromAsset('lambda'), //  this folder contains `anomalyTrigger.js`
            environment: {
                BUCKET_NAME: bucket.bucketName,
            }
        });
        bucket.grantRead(anomalyFn);
    }
}
exports.AnomalyStack = AnomalyStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5vbWFseS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFub21hbHktc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkNBQWdEO0FBRWhELGlEQUFpRDtBQUNqRCx5Q0FBeUM7QUFFekMsTUFBYSxZQUFhLFNBQVEsbUJBQUs7SUFDckMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFrQjtRQUMxRCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsd0JBQXdCLEVBQUUsbURBQW1ELENBQUMsQ0FBQztRQUU3SCxNQUFNLFNBQVMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLHlCQUF5QixFQUFFO1lBQ3JFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsT0FBTyxFQUFFLHdCQUF3QixFQUFJLHdEQUF3RDtZQUM3RixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEVBQUcsNENBQTRDO1lBQ3BGLFdBQVcsRUFBRTtnQkFDWCxXQUFXLEVBQUUsTUFBTSxDQUFDLFVBQVU7YUFDL0I7U0FDRixDQUFDLENBQUM7UUFFSCxNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzlCLENBQUM7Q0FDRjtBQWpCRCxvQ0FpQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTdGFjaywgU3RhY2tQcm9wcyB9IGZyb20gJ2F3cy1jZGstbGliJztcclxuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XHJcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcclxuaW1wb3J0ICogYXMgczMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBBbm9tYWx5U3RhY2sgZXh0ZW5kcyBTdGFjayB7XHJcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBTdGFja1Byb3BzKSB7XHJcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcclxuXHJcbiAgICBjb25zdCBidWNrZXQgPSBzMy5CdWNrZXQuZnJvbUJ1Y2tldE5hbWUodGhpcywgJ1Byb2Nlc3NlZERhdGFzZXRCdWNrZXQnLCAnc2Vuc2VhaS1wcm9jZXNzZWQtdHJhbnNhY3Rpb25zLWRhdGFzZXQtaGoyMDI1MDQyNicpO1xyXG5cclxuICAgIGNvbnN0IGFub21hbHlGbiA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0Fub21hbHlEZXRlY3Rpb25UcmlnZ2VyJywge1xyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCwgIFxyXG4gICAgICBoYW5kbGVyOiAnYW5vbWFseVRyaWdnZXIuaGFuZGxlcicsICAgLy8gIHRoaXMgbWF0Y2hlcyBgYW5vbWFseVRyaWdnZXIuanNgICsgYGV4cG9ydHMuaGFuZGxlcmBcclxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCdsYW1iZGEnKSwgIC8vICB0aGlzIGZvbGRlciBjb250YWlucyBgYW5vbWFseVRyaWdnZXIuanNgXHJcbiAgICAgIGVudmlyb25tZW50OiB7XHJcbiAgICAgICAgQlVDS0VUX05BTUU6IGJ1Y2tldC5idWNrZXROYW1lLFxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBidWNrZXQuZ3JhbnRSZWFkKGFub21hbHlGbik7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuIl19