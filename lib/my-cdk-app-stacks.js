"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyCdkStack = void 0;
const cdk = require("aws-cdk-lib");
const s3 = require("aws-cdk-lib/aws-s3");
const s3deploy = require("aws-cdk-lib/aws-s3-deployment");
const cloudfront = require("aws-cdk-lib/aws-cloudfront");
const aws_cdk_lib_1 = require("aws-cdk-lib");
class MyCdkStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // S3 Bucket for uploading obj in bucket
        this.uploadobjBucket = new s3.Bucket(this, 'uploadobjBucket', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            cors: [{
                    allowedOrigins: ['*'], // Or use your CloudFront URL
                    allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.GET, s3.HttpMethods.HEAD, s3.HttpMethods.POST],
                    allowedHeaders: ['*'],
                }],
        });
        /* new cdk.CfnOutput(this, 'uploadObjBucketArnOutput', {
          value: this.uploadobjBucket.bucketName,
          exportName: 'uploadObjBucketName',
        }); */
        // S3 Bucket for React Website (without public access)
        this.TransactionUploadsBucket = new s3.Bucket(this, "TransactionUploadsBucket ", {
            websiteIndexDocument: "index.html",
            websiteErrorDocument: "error.html",
            versioned: true,
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY,
            /*  publicReadAccess: true,
             blockPublicAccess: new s3.BlockPublicAccess({
               blockPublicAcls: false,
               blockPublicPolicy: false,
               ignorePublicAcls: false,
               restrictPublicBuckets: false,
                 }), */
            cors: [
                {
                    allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.GET, s3.HttpMethods.HEAD],
                    allowedOrigins: ["*"], // Change to your actual domain in production
                    allowedHeaders: ["*"],
                },
            ],
        });
        // Processed bucket for output data
        this.processedBucket = new s3.Bucket(this, "ProcessedBucket", {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            cors: [{
                    allowedOrigins: ['*'], // Or use your CloudFront URL
                    allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.GET, s3.HttpMethods.HEAD, s3.HttpMethods.POST],
                    allowedHeaders: ['*'],
                }],
        });
        new cdk.CfnOutput(this, 'ProcessedBucketNameExport', {
            value: this.processedBucket.bucketName,
            exportName: 'ProcessedBucketName',
        });
        // Deploy React App to S3
        new s3deploy.BucketDeployment(this, "DeployWebsite", {
            sources: [s3deploy.Source.asset("frontend/build")],
            destinationBucket: this.TransactionUploadsBucket,
        });
        // CloudFront Distribution for S3 bucket
        const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, "CloudFrontOAI");
        this.TransactionUploadsBucket.grantRead(cloudfrontOAI); // Grant CloudFront access to the S3 bucket
        const cloudfrontDistribution = new cloudfront.CloudFrontWebDistribution(this, "CloudFrontDistribution", {
            originConfigs: [
                {
                    s3OriginSource: {
                        s3BucketSource: this.TransactionUploadsBucket,
                        originAccessIdentity: cloudfrontOAI, // Associate OAI with the CloudFront distribution
                    },
                    behaviors: [{ isDefaultBehavior: true }],
                },
            ],
        });
        // Output the CloudFront URL for the website
        new cdk.CfnOutput(this, "CloudFrontURL", {
            value: cloudfrontDistribution.distributionDomainName,
            description: "The URL of the CloudFront distribution for the website",
        });
    }
}
exports.MyCdkStack = MyCdkStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXktY2RrLWFwcC1zdGFja3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJteS1jZGstYXBwLXN0YWNrcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFDbkMseUNBQXlDO0FBQ3pDLDBEQUEwRDtBQUMxRCx5REFBeUQ7QUFDekQsNkNBQTRDO0FBRTVDLE1BQWEsVUFBVyxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBS3ZDLFlBQVksS0FBYyxFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM1RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUt2Qix3Q0FBd0M7UUFDekMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFO1lBQ3hELGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU87WUFDeEMsaUJBQWlCLEVBQUUsSUFBSTtZQUN2QixJQUFJLEVBQUUsQ0FBQztvQkFDTCxjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSw2QkFBNkI7b0JBQ3BELGNBQWMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO29CQUNqRyxjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUM7aUJBQ3RCLENBQUM7U0FDSCxDQUFDLENBQUM7UUFFSDs7O2NBR007UUFFVixzREFBc0Q7UUFDdEQsSUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsMkJBQTJCLEVBQUU7WUFFL0Usb0JBQW9CLEVBQUUsWUFBWTtZQUNsQyxvQkFBb0IsRUFBRSxZQUFZO1lBQ2xDLFNBQVMsRUFBRSxJQUFJO1lBQ2YsYUFBYSxFQUFFLDJCQUFhLENBQUMsT0FBTztZQUNyQzs7Ozs7O3VCQU1XO1lBRVYsSUFBSSxFQUFFO2dCQUNKO29CQUNFLGNBQWMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO29CQUM3RSxjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSw2Q0FBNkM7b0JBQ3BFLGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FBQztpQkFDdEI7YUFDRjtTQUNGLENBQUMsQ0FBQztRQUtILG1DQUFtQztRQUNuQyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUU7WUFDNUQsYUFBYSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsT0FBTztZQUN4QyxpQkFBaUIsRUFBRSxJQUFJO1lBQ3ZCLElBQUksRUFBRSxDQUFDO29CQUNMLGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLDZCQUE2QjtvQkFDcEQsY0FBYyxFQUFFLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7b0JBQ2pHLGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FBQztpQkFDdEIsQ0FBQztTQUNILENBQUMsQ0FBQztRQUNILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsMkJBQTJCLEVBQUU7WUFDbkQsS0FBSyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVTtZQUN0QyxVQUFVLEVBQUUscUJBQXFCO1NBQ2xDLENBQUMsQ0FBQztRQUVILHlCQUF5QjtRQUN6QixJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQ25ELE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDbEQsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLHdCQUF3QjtTQUNqRCxDQUFDLENBQUM7UUFFSCx3Q0FBd0M7UUFDeEMsTUFBTSxhQUFhLEdBQUcsSUFBSSxVQUFVLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBRWpGLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQywyQ0FBMkM7UUFFbkcsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLFVBQVUsQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLEVBQUUsd0JBQXdCLEVBQUU7WUFDdEcsYUFBYSxFQUFFO2dCQUNiO29CQUNFLGNBQWMsRUFBRTt3QkFDZCxjQUFjLEVBQUUsSUFBSSxDQUFDLHdCQUF3Qjt3QkFDN0Msb0JBQW9CLEVBQUUsYUFBYSxFQUFHLGlEQUFpRDtxQkFDeEY7b0JBQ0QsU0FBUyxFQUFFLENBQUMsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsQ0FBQztpQkFDekM7YUFDRjtTQUVGLENBQUMsQ0FBQztRQUVILDRDQUE0QztRQUM1QyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUN2QyxLQUFLLEVBQUUsc0JBQXNCLENBQUMsc0JBQXNCO1lBQ3BELFdBQVcsRUFBRSx3REFBd0Q7U0FDdEUsQ0FBQyxDQUFDO0lBRUwsQ0FBQztDQUNGO0FBcEdELGdDQW9HQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiYXdzLWNkay1saWJcIjtcclxuaW1wb3J0ICogYXMgczMgZnJvbSBcImF3cy1jZGstbGliL2F3cy1zM1wiO1xyXG5pbXBvcnQgKiBhcyBzM2RlcGxveSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLXMzLWRlcGxveW1lbnRcIjtcclxuaW1wb3J0ICogYXMgY2xvdWRmcm9udCBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWNsb3VkZnJvbnRcIjtcclxuaW1wb3J0IHsgUmVtb3ZhbFBvbGljeSB9IGZyb20gXCJhd3MtY2RrLWxpYlwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIE15Q2RrU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xyXG4gIHB1YmxpYyByZWFkb25seSBUcmFuc2FjdGlvblVwbG9hZHNCdWNrZXQ6IHMzLkJ1Y2tldDtcclxuICBwdWJsaWMgcmVhZG9ubHkgdXBsb2Fkb2JqQnVja2V0OiBzMy5CdWNrZXQ7XHJcbiAgcHVibGljIHJlYWRvbmx5IHByb2Nlc3NlZEJ1Y2tldDogczMuQnVja2V0OyAvLyBpIHdpbGwgY2hlY2sgaWYgaXQgbmVzY2NlYXJ5IG9yIG5vdFxyXG5cclxuICBjb25zdHJ1Y3RvcihzY29wZTogY2RrLkFwcCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xyXG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XHJcblxyXG5cclxuXHJcblxyXG4gICAgIC8vIFMzIEJ1Y2tldCBmb3IgdXBsb2FkaW5nIG9iaiBpbiBidWNrZXRcclxuICAgIHRoaXMudXBsb2Fkb2JqQnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCAndXBsb2Fkb2JqQnVja2V0Jywge1xyXG4gICAgICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcclxuICAgICAgICAgIGF1dG9EZWxldGVPYmplY3RzOiB0cnVlLFxyXG4gICAgICAgICAgY29yczogW3tcclxuICAgICAgICAgICAgYWxsb3dlZE9yaWdpbnM6IFsnKiddLCAvLyBPciB1c2UgeW91ciBDbG91ZEZyb250IFVSTFxyXG4gICAgICAgICAgICBhbGxvd2VkTWV0aG9kczogW3MzLkh0dHBNZXRob2RzLlBVVCwgczMuSHR0cE1ldGhvZHMuR0VULCBzMy5IdHRwTWV0aG9kcy5IRUFELHMzLkh0dHBNZXRob2RzLlBPU1RdLFxyXG4gICAgICAgICAgICBhbGxvd2VkSGVhZGVyczogWycqJ10sXHJcbiAgICAgICAgICB9XSxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLyogbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ3VwbG9hZE9iakJ1Y2tldEFybk91dHB1dCcsIHtcclxuICAgICAgICAgIHZhbHVlOiB0aGlzLnVwbG9hZG9iakJ1Y2tldC5idWNrZXROYW1lLFxyXG4gICAgICAgICAgZXhwb3J0TmFtZTogJ3VwbG9hZE9iakJ1Y2tldE5hbWUnLFxyXG4gICAgICAgIH0pOyAqL1xyXG4gICAgICAgIFxyXG4gICAgLy8gUzMgQnVja2V0IGZvciBSZWFjdCBXZWJzaXRlICh3aXRob3V0IHB1YmxpYyBhY2Nlc3MpXHJcbiAgICB0aGlzLlRyYW5zYWN0aW9uVXBsb2Fkc0J1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgXCJUcmFuc2FjdGlvblVwbG9hZHNCdWNrZXQgXCIsIHtcclxuICAgICAgXHJcbiAgICAgIHdlYnNpdGVJbmRleERvY3VtZW50OiBcImluZGV4Lmh0bWxcIixcclxuICAgICAgd2Vic2l0ZUVycm9yRG9jdW1lbnQ6IFwiZXJyb3IuaHRtbFwiLFxyXG4gICAgICB2ZXJzaW9uZWQ6IHRydWUsXHJcbiAgICAgIHJlbW92YWxQb2xpY3k6IFJlbW92YWxQb2xpY3kuREVTVFJPWSxcclxuICAgICAvKiAgcHVibGljUmVhZEFjY2VzczogdHJ1ZSxcclxuICAgICAgYmxvY2tQdWJsaWNBY2Nlc3M6IG5ldyBzMy5CbG9ja1B1YmxpY0FjY2Vzcyh7XHJcbiAgICAgICAgYmxvY2tQdWJsaWNBY2xzOiBmYWxzZSxcclxuICAgICAgICBibG9ja1B1YmxpY1BvbGljeTogZmFsc2UsXHJcbiAgICAgICAgaWdub3JlUHVibGljQWNsczogZmFsc2UsXHJcbiAgICAgICAgcmVzdHJpY3RQdWJsaWNCdWNrZXRzOiBmYWxzZSxcclxuICAgICAgICAgIH0pLCAqL1xyXG4gICAgICBcclxuICAgICAgY29yczogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIGFsbG93ZWRNZXRob2RzOiBbczMuSHR0cE1ldGhvZHMuUFVULCBzMy5IdHRwTWV0aG9kcy5HRVQsIHMzLkh0dHBNZXRob2RzLkhFQURdLFxyXG4gICAgICAgICAgYWxsb3dlZE9yaWdpbnM6IFtcIipcIl0sIC8vIENoYW5nZSB0byB5b3VyIGFjdHVhbCBkb21haW4gaW4gcHJvZHVjdGlvblxyXG4gICAgICAgICAgYWxsb3dlZEhlYWRlcnM6IFtcIipcIl0sXHJcbiAgICAgICAgfSxcclxuICAgICAgXSxcclxuICAgIH0pO1xyXG5cclxuXHJcblxyXG5cclxuICAgIC8vIFByb2Nlc3NlZCBidWNrZXQgZm9yIG91dHB1dCBkYXRhXHJcbiAgICB0aGlzLnByb2Nlc3NlZEJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgXCJQcm9jZXNzZWRCdWNrZXRcIiwge1xyXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxyXG4gICAgICBhdXRvRGVsZXRlT2JqZWN0czogdHJ1ZSxcclxuICAgICAgY29yczogW3tcclxuICAgICAgICBhbGxvd2VkT3JpZ2luczogWycqJ10sIC8vIE9yIHVzZSB5b3VyIENsb3VkRnJvbnQgVVJMXHJcbiAgICAgICAgYWxsb3dlZE1ldGhvZHM6IFtzMy5IdHRwTWV0aG9kcy5QVVQsIHMzLkh0dHBNZXRob2RzLkdFVCwgczMuSHR0cE1ldGhvZHMuSEVBRCxzMy5IdHRwTWV0aG9kcy5QT1NUXSxcclxuICAgICAgICBhbGxvd2VkSGVhZGVyczogWycqJ10sXHJcbiAgICAgIH1dLFxyXG4gICAgfSk7XHJcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnUHJvY2Vzc2VkQnVja2V0TmFtZUV4cG9ydCcsIHtcclxuICAgICAgdmFsdWU6IHRoaXMucHJvY2Vzc2VkQnVja2V0LmJ1Y2tldE5hbWUsXHJcbiAgICAgIGV4cG9ydE5hbWU6ICdQcm9jZXNzZWRCdWNrZXROYW1lJyxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIERlcGxveSBSZWFjdCBBcHAgdG8gUzNcclxuICAgIG5ldyBzM2RlcGxveS5CdWNrZXREZXBsb3ltZW50KHRoaXMsIFwiRGVwbG95V2Vic2l0ZVwiLCB7XHJcbiAgICAgIHNvdXJjZXM6IFtzM2RlcGxveS5Tb3VyY2UuYXNzZXQoXCJmcm9udGVuZC9idWlsZFwiKV0sXHJcbiAgICAgIGRlc3RpbmF0aW9uQnVja2V0OiB0aGlzLlRyYW5zYWN0aW9uVXBsb2Fkc0J1Y2tldCxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIENsb3VkRnJvbnQgRGlzdHJpYnV0aW9uIGZvciBTMyBidWNrZXRcclxuICAgIGNvbnN0IGNsb3VkZnJvbnRPQUkgPSBuZXcgY2xvdWRmcm9udC5PcmlnaW5BY2Nlc3NJZGVudGl0eSh0aGlzLCBcIkNsb3VkRnJvbnRPQUlcIik7XHJcblxyXG4gICAgdGhpcy5UcmFuc2FjdGlvblVwbG9hZHNCdWNrZXQuZ3JhbnRSZWFkKGNsb3VkZnJvbnRPQUkpOyAvLyBHcmFudCBDbG91ZEZyb250IGFjY2VzcyB0byB0aGUgUzMgYnVja2V0XHJcblxyXG4gICAgY29uc3QgY2xvdWRmcm9udERpc3RyaWJ1dGlvbiA9IG5ldyBjbG91ZGZyb250LkNsb3VkRnJvbnRXZWJEaXN0cmlidXRpb24odGhpcywgXCJDbG91ZEZyb250RGlzdHJpYnV0aW9uXCIsIHtcclxuICAgICAgb3JpZ2luQ29uZmlnczogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIHMzT3JpZ2luU291cmNlOiB7XHJcbiAgICAgICAgICAgIHMzQnVja2V0U291cmNlOiB0aGlzLlRyYW5zYWN0aW9uVXBsb2Fkc0J1Y2tldCxcclxuICAgICAgICAgICAgb3JpZ2luQWNjZXNzSWRlbnRpdHk6IGNsb3VkZnJvbnRPQUksICAvLyBBc3NvY2lhdGUgT0FJIHdpdGggdGhlIENsb3VkRnJvbnQgZGlzdHJpYnV0aW9uXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgYmVoYXZpb3JzOiBbeyBpc0RlZmF1bHRCZWhhdmlvcjogdHJ1ZSB9XSxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgICBcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE91dHB1dCB0aGUgQ2xvdWRGcm9udCBVUkwgZm9yIHRoZSB3ZWJzaXRlXHJcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcIkNsb3VkRnJvbnRVUkxcIiwge1xyXG4gICAgICB2YWx1ZTogY2xvdWRmcm9udERpc3RyaWJ1dGlvbi5kaXN0cmlidXRpb25Eb21haW5OYW1lLFxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJUaGUgVVJMIG9mIHRoZSBDbG91ZEZyb250IGRpc3RyaWJ1dGlvbiBmb3IgdGhlIHdlYnNpdGVcIixcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgfVxyXG59XHJcblxyXG4iXX0=