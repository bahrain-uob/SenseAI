"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsiteHostingStack = void 0;
const cdk = require("aws-cdk-lib");
const s3 = require("aws-cdk-lib/aws-s3");
const cloudfront = require("aws-cdk-lib/aws-cloudfront");
const s3deploy = require("aws-cdk-lib/aws-s3-deployment");
class WebsiteHostingStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // 1. S3 Bucket (Private)
        const websiteBucket = new s3.Bucket(this, "PrivateWebsiteBucket", {
            websiteIndexDocument: "index.html",
            websiteErrorDocument: "error.html",
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // Private
        });
        // 2. CloudFront OAI (grants CloudFront access to private bucket)
        const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, "CloudFrontOAI");
        websiteBucket.grantRead(cloudfrontOAI);
        // 3. CloudFront Distribution
        const distribution = new cloudfront.CloudFrontWebDistribution(this, "WebsiteDistribution", {
            originConfigs: [
                {
                    s3OriginSource: {
                        s3BucketSource: websiteBucket,
                        originAccessIdentity: cloudfrontOAI,
                    },
                    behaviors: [
                        {
                            isDefaultBehavior: true,
                            viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                        },
                    ],
                },
            ],
        });
        // 4. Deploy React Build to S3
        new s3deploy.BucketDeployment(this, "DeployReactApp", {
            sources: [s3deploy.Source.asset("frontend/build")], // Change path if needed
            destinationBucket: websiteBucket,
            distribution: distribution, // Invalidate CloudFront cache
            distributionPaths: ["/*"],
        });
        // 5. Output the CloudFront URL
        new cdk.CfnOutput(this, "WebsiteURL", {
            value: `https://${distribution.distributionDomainName}`,
            description: "URL of the hosted React app",
        });
    }
}
exports.WebsiteHostingStack = WebsiteHostingStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViaG9zdGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIndlYmhvc3RpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLHlDQUF5QztBQUN6Qyx5REFBeUQ7QUFDekQsMERBQTBEO0FBRTFELE1BQWEsbUJBQW9CLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDaEQsWUFBWSxLQUFjLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzVELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLHlCQUF5QjtRQUN6QixNQUFNLGFBQWEsR0FBRyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLHNCQUFzQixFQUFFO1lBQ2hFLG9CQUFvQixFQUFFLFlBQVk7WUFDbEMsb0JBQW9CLEVBQUUsWUFBWTtZQUNsQyxhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPO1lBQ3hDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsVUFBVTtTQUM5RCxDQUFDLENBQUM7UUFFSCxpRUFBaUU7UUFDakUsTUFBTSxhQUFhLEdBQUcsSUFBSSxVQUFVLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQ2pGLGFBQWEsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFdkMsNkJBQTZCO1FBQzdCLE1BQU0sWUFBWSxHQUFHLElBQUksVUFBVSxDQUFDLHlCQUF5QixDQUFDLElBQUksRUFBRSxxQkFBcUIsRUFBRTtZQUN6RixhQUFhLEVBQUU7Z0JBQ2I7b0JBQ0UsY0FBYyxFQUFFO3dCQUNkLGNBQWMsRUFBRSxhQUFhO3dCQUM3QixvQkFBb0IsRUFBRSxhQUFhO3FCQUNwQztvQkFDRCxTQUFTLEVBQUU7d0JBQ1Q7NEJBQ0UsaUJBQWlCLEVBQUUsSUFBSTs0QkFDdkIsb0JBQW9CLEVBQUUsVUFBVSxDQUFDLG9CQUFvQixDQUFDLGlCQUFpQjt5QkFDeEU7cUJBQ0Y7aUJBQ0Y7YUFDRjtTQUNGLENBQUMsQ0FBQztRQUVILDhCQUE4QjtRQUM5QixJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDcEQsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxFQUFFLHdCQUF3QjtZQUMvRSxpQkFBaUIsRUFBRSxhQUFhO1lBQ2hDLFlBQVksRUFBRSxZQUFZLEVBQUUsOEJBQThCO1lBQzFELGlCQUFpQixFQUFFLENBQUMsSUFBSSxDQUFDO1NBQzFCLENBQUMsQ0FBQztRQUVILCtCQUErQjtRQUMvQixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtZQUNwQyxLQUFLLEVBQUUsV0FBVyxZQUFZLENBQUMsc0JBQXNCLEVBQUU7WUFDdkQsV0FBVyxFQUFFLDZCQUE2QjtTQUMzQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFoREQsa0RBZ0RDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gXCJhd3MtY2RrLWxpYlwiO1xyXG5pbXBvcnQgKiBhcyBzMyBmcm9tIFwiYXdzLWNkay1saWIvYXdzLXMzXCI7XHJcbmltcG9ydCAqIGFzIGNsb3VkZnJvbnQgZnJvbSBcImF3cy1jZGstbGliL2F3cy1jbG91ZGZyb250XCI7XHJcbmltcG9ydCAqIGFzIHMzZGVwbG95IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtczMtZGVwbG95bWVudFwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFdlYnNpdGVIb3N0aW5nU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xyXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBjZGsuQXBwLCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XHJcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcclxuXHJcbiAgICAvLyAxLiBTMyBCdWNrZXQgKFByaXZhdGUpXHJcbiAgICBjb25zdCB3ZWJzaXRlQnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCBcIlByaXZhdGVXZWJzaXRlQnVja2V0XCIsIHtcclxuICAgICAgd2Vic2l0ZUluZGV4RG9jdW1lbnQ6IFwiaW5kZXguaHRtbFwiLFxyXG4gICAgICB3ZWJzaXRlRXJyb3JEb2N1bWVudDogXCJlcnJvci5odG1sXCIsXHJcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXHJcbiAgICAgIGJsb2NrUHVibGljQWNjZXNzOiBzMy5CbG9ja1B1YmxpY0FjY2Vzcy5CTE9DS19BTEwsIC8vIFByaXZhdGVcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIDIuIENsb3VkRnJvbnQgT0FJIChncmFudHMgQ2xvdWRGcm9udCBhY2Nlc3MgdG8gcHJpdmF0ZSBidWNrZXQpXHJcbiAgICBjb25zdCBjbG91ZGZyb250T0FJID0gbmV3IGNsb3VkZnJvbnQuT3JpZ2luQWNjZXNzSWRlbnRpdHkodGhpcywgXCJDbG91ZEZyb250T0FJXCIpO1xyXG4gICAgd2Vic2l0ZUJ1Y2tldC5ncmFudFJlYWQoY2xvdWRmcm9udE9BSSk7XHJcblxyXG4gICAgLy8gMy4gQ2xvdWRGcm9udCBEaXN0cmlidXRpb25cclxuICAgIGNvbnN0IGRpc3RyaWJ1dGlvbiA9IG5ldyBjbG91ZGZyb250LkNsb3VkRnJvbnRXZWJEaXN0cmlidXRpb24odGhpcywgXCJXZWJzaXRlRGlzdHJpYnV0aW9uXCIsIHtcclxuICAgICAgb3JpZ2luQ29uZmlnczogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIHMzT3JpZ2luU291cmNlOiB7XHJcbiAgICAgICAgICAgIHMzQnVja2V0U291cmNlOiB3ZWJzaXRlQnVja2V0LFxyXG4gICAgICAgICAgICBvcmlnaW5BY2Nlc3NJZGVudGl0eTogY2xvdWRmcm9udE9BSSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBiZWhhdmlvcnM6IFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGlzRGVmYXVsdEJlaGF2aW9yOiB0cnVlLFxyXG4gICAgICAgICAgICAgIHZpZXdlclByb3RvY29sUG9saWN5OiBjbG91ZGZyb250LlZpZXdlclByb3RvY29sUG9saWN5LlJFRElSRUNUX1RPX0hUVFBTLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgXSxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gNC4gRGVwbG95IFJlYWN0IEJ1aWxkIHRvIFMzXHJcbiAgICBuZXcgczNkZXBsb3kuQnVja2V0RGVwbG95bWVudCh0aGlzLCBcIkRlcGxveVJlYWN0QXBwXCIsIHtcclxuICAgICAgc291cmNlczogW3MzZGVwbG95LlNvdXJjZS5hc3NldChcIi4uL2Zyb250ZW5kL2J1aWxkXCIpXSwgLy8gQ2hhbmdlIHBhdGggaWYgbmVlZGVkXHJcbiAgICAgIGRlc3RpbmF0aW9uQnVja2V0OiB3ZWJzaXRlQnVja2V0LFxyXG4gICAgICBkaXN0cmlidXRpb246IGRpc3RyaWJ1dGlvbiwgLy8gSW52YWxpZGF0ZSBDbG91ZEZyb250IGNhY2hlXHJcbiAgICAgIGRpc3RyaWJ1dGlvblBhdGhzOiBbXCIvKlwiXSxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIDUuIE91dHB1dCB0aGUgQ2xvdWRGcm9udCBVUkxcclxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiV2Vic2l0ZVVSTFwiLCB7XHJcbiAgICAgIHZhbHVlOiBgaHR0cHM6Ly8ke2Rpc3RyaWJ1dGlvbi5kaXN0cmlidXRpb25Eb21haW5OYW1lfWAsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlVSTCBvZiB0aGUgaG9zdGVkIFJlYWN0IGFwcFwiLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59Il19