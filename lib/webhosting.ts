import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";

export class WebsiteHostingStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
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
      sources: [s3deploy.Source.asset("../frontend/build")], // Change path if needed
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