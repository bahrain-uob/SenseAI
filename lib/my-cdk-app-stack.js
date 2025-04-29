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
        // S3 Bucket for React Website (without public access)
        this.TransactionUploadsBucket = new s3.Bucket(this, "TransactionUploadsBucket ", {
            
            websiteIndexDocument: "index.html",
            websiteErrorDocument: "error.html",
            versioned: true,
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY,
            /* autoDeleteObjects: true,
            blockPublicAccess: new s3.BlockPublicAccess({
                blockPublicAcls: false,
                blockPublicPolicy: false,
                ignorePublicAcls: false,
                restrictPublicBuckets: false,
                  }), */
             // Block public access to the bucket
            cors: [
                {
                    allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.GET, s3.HttpMethods.HEAD],
                    allowedOrigins: ["https://d10uresn4y47do.cloudfront.net"], // Change to your actual domain in production
                    allowedHeaders: ["*"],
                },
            ],
        });
        
        // Deploy React App to S3
        new s3deploy.BucketDeployment(this, "DeployWebsite", {
            sources: [s3deploy.Source.asset("./frontend/build")],
            destinationBucket: this.TransactionUploadsBucket,
        });
        // CloudFront Distribution for S3 bucket
        const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, "OriginAccessIdentity");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXktY2RrLWFwcC1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm15LWNkay1hcHAtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLHlDQUF5QztBQUN6QywwREFBMEQ7QUFDMUQseURBQXlEO0FBQ3pELDZDQUE0QztBQUU1QyxNQUFhLFVBQVcsU0FBUSxHQUFHLENBQUMsS0FBSztJQUd2QyxZQUFZLEtBQWMsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDNUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsc0RBQXNEO1FBQ3RELElBQUksQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLDJCQUEyQixFQUFFO1lBQy9FLG9CQUFvQixFQUFFLFlBQVk7WUFDbEMsb0JBQW9CLEVBQUUsWUFBWTtZQUNsQyxTQUFTLEVBQUUsSUFBSTtZQUNmLGFBQWEsRUFBRSwyQkFBYSxDQUFDLE9BQU87WUFDcEMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRyxvQ0FBb0M7WUFDeEYsSUFBSSxFQUFFO2dCQUNKO29CQUNFLGNBQWMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO29CQUM3RSxjQUFjLEVBQUUsQ0FBQyx1Q0FBdUMsQ0FBQyxFQUFFLDZDQUE2QztvQkFDeEcsY0FBYyxFQUFFLENBQUMsR0FBRyxDQUFDO2lCQUN0QjthQUNGO1NBQ0YsQ0FBQyxDQUFDO1FBR0gseUJBQXlCO1FBQ3pCLElBQUksUUFBUSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDbkQsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUNwRCxpQkFBaUIsRUFBRSxJQUFJLENBQUMsd0JBQXdCO1NBQ2pELENBQUMsQ0FBQztRQUVILHdDQUF3QztRQUN4QyxNQUFNLGFBQWEsR0FBRyxJQUFJLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztRQUV4RixJQUFJLENBQUMsd0JBQXdCLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsMkNBQTJDO1FBRW5HLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxVQUFVLENBQUMseUJBQXlCLENBQUMsSUFBSSxFQUFFLHdCQUF3QixFQUFFO1lBQ3RHLGFBQWEsRUFBRTtnQkFDYjtvQkFDRSxjQUFjLEVBQUU7d0JBQ2QsY0FBYyxFQUFFLElBQUksQ0FBQyx3QkFBd0I7d0JBQzdDLG9CQUFvQixFQUFFLGFBQWEsRUFBRyxpREFBaUQ7cUJBQ3hGO29CQUNELFNBQVMsRUFBRSxDQUFDLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLENBQUM7aUJBQ3pDO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFFSCw0Q0FBNEM7UUFDNUMsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDdkMsS0FBSyxFQUFFLHNCQUFzQixDQUFDLHNCQUFzQjtZQUNwRCxXQUFXLEVBQUUsd0RBQXdEO1NBQ3RFLENBQUMsQ0FBQztJQUVMLENBQUM7Q0FDRjtBQXJERCxnQ0FxREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSBcImF3cy1jZGstbGliXCI7XHJcbmltcG9ydCAqIGFzIHMzIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtczNcIjtcclxuaW1wb3J0ICogYXMgczNkZXBsb3kgZnJvbSBcImF3cy1jZGstbGliL2F3cy1zMy1kZXBsb3ltZW50XCI7XHJcbmltcG9ydCAqIGFzIGNsb3VkZnJvbnQgZnJvbSBcImF3cy1jZGstbGliL2F3cy1jbG91ZGZyb250XCI7XHJcbmltcG9ydCB7IFJlbW92YWxQb2xpY3kgfSBmcm9tIFwiYXdzLWNkay1saWJcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBNeUNka1N0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcclxuICBwdWJsaWMgcmVhZG9ubHkgVHJhbnNhY3Rpb25VcGxvYWRzQnVja2V0OiBzMy5CdWNrZXQ7IC8vIGkgd2lsbCBjaGVjayBpZiBpdCBuZXNjY2Vhcnkgb3Igbm90XHJcblxyXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBjZGsuQXBwLCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XHJcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcclxuXHJcbiAgICAvLyBTMyBCdWNrZXQgZm9yIFJlYWN0IFdlYnNpdGUgKHdpdGhvdXQgcHVibGljIGFjY2VzcylcclxuICAgIHRoaXMuVHJhbnNhY3Rpb25VcGxvYWRzQnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCBcIlRyYW5zYWN0aW9uVXBsb2Fkc0J1Y2tldCBcIiwge1xyXG4gICAgICB3ZWJzaXRlSW5kZXhEb2N1bWVudDogXCJpbmRleC5odG1sXCIsXHJcbiAgICAgIHdlYnNpdGVFcnJvckRvY3VtZW50OiBcImVycm9yLmh0bWxcIixcclxuICAgICAgdmVyc2lvbmVkOiB0cnVlLFxyXG4gICAgICByZW1vdmFsUG9saWN5OiBSZW1vdmFsUG9saWN5LkRFU1RST1ksXHJcbiAgICAgIGJsb2NrUHVibGljQWNjZXNzOiBzMy5CbG9ja1B1YmxpY0FjY2Vzcy5CTE9DS19BTEwsICAvLyBCbG9jayBwdWJsaWMgYWNjZXNzIHRvIHRoZSBidWNrZXRcclxuICAgICAgY29yczogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIGFsbG93ZWRNZXRob2RzOiBbczMuSHR0cE1ldGhvZHMuUFVULCBzMy5IdHRwTWV0aG9kcy5HRVQsIHMzLkh0dHBNZXRob2RzLkhFQURdLFxyXG4gICAgICAgICAgYWxsb3dlZE9yaWdpbnM6IFtcImh0dHBzOi8vZDEwdXJlc240eTQ3ZG8uY2xvdWRmcm9udC5uZXRcIl0sIC8vIENoYW5nZSB0byB5b3VyIGFjdHVhbCBkb21haW4gaW4gcHJvZHVjdGlvblxyXG4gICAgICAgICAgYWxsb3dlZEhlYWRlcnM6IFtcIipcIl0sXHJcbiAgICAgICAgfSxcclxuICAgICAgXSxcclxuICAgIH0pO1xyXG4gICAgXHJcblxyXG4gICAgLy8gRGVwbG95IFJlYWN0IEFwcCB0byBTM1xyXG4gICAgbmV3IHMzZGVwbG95LkJ1Y2tldERlcGxveW1lbnQodGhpcywgXCJEZXBsb3lXZWJzaXRlXCIsIHtcclxuICAgICAgc291cmNlczogW3MzZGVwbG95LlNvdXJjZS5hc3NldChcIi4vZnJvbnRlbmQvYnVpbGRcIildLFxyXG4gICAgICBkZXN0aW5hdGlvbkJ1Y2tldDogdGhpcy5UcmFuc2FjdGlvblVwbG9hZHNCdWNrZXQsXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBDbG91ZEZyb250IERpc3RyaWJ1dGlvbiBmb3IgUzMgYnVja2V0XHJcbiAgICBjb25zdCBjbG91ZGZyb250T0FJID0gbmV3IGNsb3VkZnJvbnQuT3JpZ2luQWNjZXNzSWRlbnRpdHkodGhpcywgXCJPcmlnaW5BY2Nlc3NJZGVudGl0eVwiKTtcclxuXHJcbiAgICB0aGlzLlRyYW5zYWN0aW9uVXBsb2Fkc0J1Y2tldC5ncmFudFJlYWQoY2xvdWRmcm9udE9BSSk7IC8vIEdyYW50IENsb3VkRnJvbnQgYWNjZXNzIHRvIHRoZSBTMyBidWNrZXRcclxuXHJcbiAgICBjb25zdCBjbG91ZGZyb250RGlzdHJpYnV0aW9uID0gbmV3IGNsb3VkZnJvbnQuQ2xvdWRGcm9udFdlYkRpc3RyaWJ1dGlvbih0aGlzLCBcIkNsb3VkRnJvbnREaXN0cmlidXRpb25cIiwge1xyXG4gICAgICBvcmlnaW5Db25maWdzOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgczNPcmlnaW5Tb3VyY2U6IHtcclxuICAgICAgICAgICAgczNCdWNrZXRTb3VyY2U6IHRoaXMuVHJhbnNhY3Rpb25VcGxvYWRzQnVja2V0LFxyXG4gICAgICAgICAgICBvcmlnaW5BY2Nlc3NJZGVudGl0eTogY2xvdWRmcm9udE9BSSwgIC8vIEFzc29jaWF0ZSBPQUkgd2l0aCB0aGUgQ2xvdWRGcm9udCBkaXN0cmlidXRpb25cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBiZWhhdmlvcnM6IFt7IGlzRGVmYXVsdEJlaGF2aW9yOiB0cnVlIH1dLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBPdXRwdXQgdGhlIENsb3VkRnJvbnQgVVJMIGZvciB0aGUgd2Vic2l0ZVxyXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJDbG91ZEZyb250VVJMXCIsIHtcclxuICAgICAgdmFsdWU6IGNsb3VkZnJvbnREaXN0cmlidXRpb24uZGlzdHJpYnV0aW9uRG9tYWluTmFtZSxcclxuICAgICAgZGVzY3JpcHRpb246IFwiVGhlIFVSTCBvZiB0aGUgQ2xvdWRGcm9udCBkaXN0cmlidXRpb24gZm9yIHRoZSB3ZWJzaXRlXCIsXHJcbiAgICB9KTtcclxuICAgIFxyXG4gIH1cclxufVxyXG5cclxuIl19