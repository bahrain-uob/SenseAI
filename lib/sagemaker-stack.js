"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SagemakerStack = void 0;
const cdk = require("aws-cdk-lib");
const s3 = require("aws-cdk-lib/aws-s3");
const sagemaker = require("aws-cdk-lib/aws-sagemaker");
const iam = require("aws-cdk-lib/aws-iam");
class SagemakerStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // S3 BUCKET FOR RAW DATASETS 
        const dataBucket = new s3.Bucket(this, 'TransactionsRawDataBucket', {
            versioned: false,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            lifecycleRules: [
                {
                    id: 'TransitionToStandardIA',
                    enabled: true,
                    transitions: [
                        {
                            storageClass: s3.StorageClass.INFREQUENT_ACCESS,
                            transitionAfter: cdk.Duration.days(30),
                        },
                    ],
                },
            ],
        });
        // IAM ROLE FOR SAGEMAKER NOTEBOOK 
        const sagemakerExecutionRole = new iam.Role(this, 'SagemakerExecutionRole', {
            assumedBy: new iam.ServicePrincipal('sagemaker.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
                iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSageMakerFullAccess'),
            ],
        });
        // SAGEMAKER NOTEBOOK INSTANCE
        const notebookInstance = new sagemaker.CfnNotebookInstance(this, 'SenseAINotebook', {
            instanceType: 'ml.t3.medium', //for testing
            roleArn: sagemakerExecutionRole.roleArn,
            notebookInstanceName: 'SenseAI-Notebook',
            directInternetAccess: 'Enabled',
            volumeSizeInGb: 10,
            rootAccess: 'Enabled',
            // defaultCodeRepository: '', // Add later if needed
        });
        // OUTPUTS
        new cdk.CfnOutput(this, 'RawDataBucketName', {
            value: dataBucket.bucketName,
            description: 'S3 bucket for raw datasets',
        });
        new cdk.CfnOutput(this, 'NotebookInstanceName', {
            value: notebookInstance.notebookInstanceName,
            description: 'SageMaker Notebook Instance Name',
        });
    }
}
exports.SagemakerStack = SagemakerStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2FnZW1ha2VyLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2FnZW1ha2VyLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUVuQyx5Q0FBeUM7QUFDekMsdURBQXVEO0FBQ3ZELDJDQUEyQztBQUUzQyxNQUFhLGNBQWUsU0FBUSxHQUFHLENBQUMsS0FBSztJQUMzQyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzlELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLDhCQUE4QjtRQUM5QixNQUFNLFVBQVUsR0FBRyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLDJCQUEyQixFQUFFO1lBQ2xFLFNBQVMsRUFBRSxLQUFLO1lBQ2hCLGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE1BQU07WUFDdkMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFNBQVM7WUFDakQsY0FBYyxFQUFFO2dCQUNkO29CQUNFLEVBQUUsRUFBRSx3QkFBd0I7b0JBQzVCLE9BQU8sRUFBRSxJQUFJO29CQUNiLFdBQVcsRUFBRTt3QkFDWDs0QkFDRSxZQUFZLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxpQkFBaUI7NEJBQy9DLGVBQWUsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7eUJBQ3ZDO3FCQUNGO2lCQUNGO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFHSCxtQ0FBbUM7UUFDbkMsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLHdCQUF3QixFQUFFO1lBQzFFLFNBQVMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyx5QkFBeUIsQ0FBQztZQUM5RCxlQUFlLEVBQUU7Z0JBQ2YsR0FBRyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxvQkFBb0IsQ0FBQztnQkFDaEUsR0FBRyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQywyQkFBMkIsQ0FBQzthQUN4RTtTQUNGLENBQUMsQ0FBQztRQUVILDhCQUE4QjtRQUM5QixNQUFNLGdCQUFnQixHQUFHLElBQUksU0FBUyxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtZQUNsRixZQUFZLEVBQUUsY0FBYyxFQUFFLGFBQWE7WUFDM0MsT0FBTyxFQUFFLHNCQUFzQixDQUFDLE9BQU87WUFDdkMsb0JBQW9CLEVBQUUsa0JBQWtCO1lBQ3hDLG9CQUFvQixFQUFFLFNBQVM7WUFDL0IsY0FBYyxFQUFFLEVBQUU7WUFDbEIsVUFBVSxFQUFFLFNBQVM7WUFDckIsb0RBQW9EO1NBQ3JELENBQUMsQ0FBQztRQUVILFVBQVU7UUFDVixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFO1lBQzNDLEtBQUssRUFBRSxVQUFVLENBQUMsVUFBVTtZQUM1QixXQUFXLEVBQUUsNEJBQTRCO1NBQzFDLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsc0JBQXNCLEVBQUU7WUFDOUMsS0FBSyxFQUFFLGdCQUFnQixDQUFDLG9CQUFxQjtZQUM3QyxXQUFXLEVBQUUsa0NBQWtDO1NBQ2hELENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQXZERCx3Q0F1REMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xyXG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcclxuaW1wb3J0ICogYXMgczMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzJztcclxuaW1wb3J0ICogYXMgc2FnZW1ha2VyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zYWdlbWFrZXInO1xyXG5pbXBvcnQgKiBhcyBpYW0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XHJcblxyXG5leHBvcnQgY2xhc3MgU2FnZW1ha2VyU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xyXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcclxuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xyXG5cclxuICAgIC8vIFMzIEJVQ0tFVCBGT1IgUkFXIERBVEFTRVRTIFxyXG4gICAgY29uc3QgZGF0YUJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgJ1RyYW5zYWN0aW9uc1Jhd0RhdGFCdWNrZXQnLCB7XHJcbiAgICAgIHZlcnNpb25lZDogZmFsc2UsXHJcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LlJFVEFJTixcclxuICAgICAgYmxvY2tQdWJsaWNBY2Nlc3M6IHMzLkJsb2NrUHVibGljQWNjZXNzLkJMT0NLX0FMTCxcclxuICAgICAgbGlmZWN5Y2xlUnVsZXM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBpZDogJ1RyYW5zaXRpb25Ub1N0YW5kYXJkSUEnLFxyXG4gICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcclxuICAgICAgICAgIHRyYW5zaXRpb25zOiBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBzdG9yYWdlQ2xhc3M6IHMzLlN0b3JhZ2VDbGFzcy5JTkZSRVFVRU5UX0FDQ0VTUyxcclxuICAgICAgICAgICAgICB0cmFuc2l0aW9uQWZ0ZXI6IGNkay5EdXJhdGlvbi5kYXlzKDMwKSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgfSxcclxuICAgICAgXSwgICAgICBcclxuICAgIH0pO1xyXG4gICAgXHJcblxyXG4gICAgLy8gSUFNIFJPTEUgRk9SIFNBR0VNQUtFUiBOT1RFQk9PSyBcclxuICAgIGNvbnN0IHNhZ2VtYWtlckV4ZWN1dGlvblJvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgJ1NhZ2VtYWtlckV4ZWN1dGlvblJvbGUnLCB7XHJcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdzYWdlbWFrZXIuYW1hem9uYXdzLmNvbScpLFxyXG4gICAgICBtYW5hZ2VkUG9saWNpZXM6IFtcclxuICAgICAgICBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ0FtYXpvblMzRnVsbEFjY2VzcycpLFxyXG4gICAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnQW1hem9uU2FnZU1ha2VyRnVsbEFjY2VzcycpLFxyXG4gICAgICBdLFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU0FHRU1BS0VSIE5PVEVCT09LIElOU1RBTkNFXHJcbiAgICBjb25zdCBub3RlYm9va0luc3RhbmNlID0gbmV3IHNhZ2VtYWtlci5DZm5Ob3RlYm9va0luc3RhbmNlKHRoaXMsICdTZW5zZUFJTm90ZWJvb2snLCB7XHJcbiAgICAgIGluc3RhbmNlVHlwZTogJ21sLnQzLm1lZGl1bScsIC8vZm9yIHRlc3RpbmdcclxuICAgICAgcm9sZUFybjogc2FnZW1ha2VyRXhlY3V0aW9uUm9sZS5yb2xlQXJuLFxyXG4gICAgICBub3RlYm9va0luc3RhbmNlTmFtZTogJ1NlbnNlQUktTm90ZWJvb2snLFxyXG4gICAgICBkaXJlY3RJbnRlcm5ldEFjY2VzczogJ0VuYWJsZWQnLFxyXG4gICAgICB2b2x1bWVTaXplSW5HYjogMTAsXHJcbiAgICAgIHJvb3RBY2Nlc3M6ICdFbmFibGVkJyxcclxuICAgICAgLy8gZGVmYXVsdENvZGVSZXBvc2l0b3J5OiAnJywgLy8gQWRkIGxhdGVyIGlmIG5lZWRlZFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gT1VUUFVUU1xyXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1Jhd0RhdGFCdWNrZXROYW1lJywge1xyXG4gICAgICB2YWx1ZTogZGF0YUJ1Y2tldC5idWNrZXROYW1lLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ1MzIGJ1Y2tldCBmb3IgcmF3IGRhdGFzZXRzJyxcclxuICAgIH0pO1xyXG5cclxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdOb3RlYm9va0luc3RhbmNlTmFtZScsIHtcclxuICAgICAgdmFsdWU6IG5vdGVib29rSW5zdGFuY2Uubm90ZWJvb2tJbnN0YW5jZU5hbWUhLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ1NhZ2VNYWtlciBOb3RlYm9vayBJbnN0YW5jZSBOYW1lJyxcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG4iXX0=