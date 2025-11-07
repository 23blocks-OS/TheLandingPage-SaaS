# AWS Setup Guide

This guide covers setting up AWS for the 23Blocks Deployment Platform.

## AWS Account Setup

### 1. Create an AWS Account

If you don't have one: https://aws.amazon.com/free/

### 2. Create an IAM User

1. Go to IAM Console: https://console.aws.amazon.com/iam/
2. Click "Users" → "Add User"
3. Set username: `23blocks-terraform`
4. Enable "Programmatic access"
5. Click "Next: Permissions"

### 3. Attach Policies

Attach these policies to the user:

- `AmazonS3FullAccess`
- `CloudFrontFullAccess`
- `AmazonRoute53FullAccess`
- `IAMFullAccess`
- `AWSCertificateManagerFullAccess`

Or create a custom policy with minimum permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:*",
        "cloudfront:*",
        "route53:*",
        "acm:*",
        "iam:CreateUser",
        "iam:CreateAccessKey",
        "iam:PutUserPolicy",
        "iam:GetUser",
        "iam:DeleteUser",
        "iam:DeleteAccessKey",
        "iam:DeleteUserPolicy"
      ],
      "Resource": "*"
    }
  ]
}
```

### 4. Get Credentials

After creating the user, you'll receive:
- Access Key ID
- Secret Access Key

**Save these securely!** You'll need them for Terraform.

### 5. Configure AWS CLI (Optional)

```bash
aws configure
```

Enter your credentials when prompted.

## Domain Configuration (Optional)

### 1. Purchase a Domain

You can buy a domain from:
- AWS Route53
- Namecheap
- GoDaddy
- Cloudflare

### 2. Update Nameservers

After running Terraform, you'll get Route53 nameservers. Update your domain registrar with these nameservers.

Example nameservers:
```
ns-123.awsdns-45.com
ns-678.awsdns-90.net
ns-1234.awsdns-56.org
ns-5678.awsdns-12.co.uk
```

### 3. Wait for DNS Propagation

DNS changes can take 24-48 hours, but usually complete in 1-2 hours.

Check propagation:
```bash
dig NS yourdomain.com
```

## Terraform Configuration

### 1. Configure AWS Credentials

Option A: Environment Variables
```bash
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="us-east-1"
```

Option B: AWS CLI Profile
```bash
aws configure --profile 23blocks
```

Then in Terraform:
```hcl
provider "aws" {
  profile = "23blocks"
  region  = "us-east-1"
}
```

### 2. Create terraform.tfvars

```hcl
aws_region   = "us-east-1"
project_name = "23blocks-deploy"
environment  = "production"

# Optional: Your domain
domain_name = "yourdomain.com"

# CloudFront price class
cloudfront_price_class = "PriceClass_100"

# Database option
use_dynamodb = false
```

### 3. Initialize Terraform

```bash
cd infrastructure/terraform
terraform init
```

### 4. Plan and Apply

```bash
terraform plan
terraform apply
```

Review the changes and type `yes` to confirm.

## Post-Terraform Setup

### 1. Save Outputs

```bash
terraform output -json > outputs.json
```

Important outputs:
- `platform_api_access_key_id`
- `platform_api_secret_access_key`
- `deployments_bucket_name`
- `cloudfront_distribution_id`
- `route53_name_servers` (if using custom domain)

### 2. Update Domain Nameservers

If you're using a custom domain, update your registrar with the Route53 nameservers from the output.

### 3. Wait for SSL Certificate

If using a custom domain, AWS Certificate Manager will validate the certificate. This usually takes 5-30 minutes.

Check status:
```bash
terraform output acm_certificate_arn
aws acm describe-certificate --certificate-arn <arn>
```

## Cost Optimization

### S3 Costs

- Storage: ~$0.023/GB/month
- Requests: ~$0.005/1,000 PUT requests

Reduce costs:
- Enable lifecycle policies to delete old deployments
- Use S3 Intelligent-Tiering

### CloudFront Costs

- Data transfer: ~$0.085/GB (first 10TB)
- Requests: ~$0.01/10,000 requests

Reduce costs:
- Use `PriceClass_100` (US/Europe only)
- Enable caching

### Route53 Costs

- Hosted zone: $0.50/month
- Queries: $0.40/million queries

### Estimated Total

For low-medium traffic:
- **$5-50/month** depending on usage

For high traffic:
- **$100-500/month**

## Security Best Practices

### 1. Enable MFA

Enable MFA for your AWS root account and IAM users.

### 2. Use IAM Roles

For production, use IAM roles instead of access keys when possible.

### 3. Enable CloudTrail

Track all API calls:
```bash
aws cloudtrail create-trail --name 23blocks-audit --s3-bucket-name my-audit-bucket
```

### 4. Enable S3 Encryption

In your Terraform, add:
```hcl
resource "aws_s3_bucket_server_side_encryption_configuration" "deployments" {
  bucket = aws_s3_bucket.deployments.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
```

### 5. Enable AWS WAF (Optional)

Add CloudFront WAF for DDoS protection:
```hcl
variable "enable_waf" {
  default = true
}
```

Cost: ~$5-10/month

## Monitoring

### 1. Enable CloudWatch

Monitor S3 and CloudFront metrics in CloudWatch.

### 2. Set Up Alarms

Create alarms for:
- High S3 costs
- CloudFront errors
- Unusual traffic patterns

### 3. Enable S3 Logging

```hcl
resource "aws_s3_bucket_logging" "deployments" {
  bucket = aws_s3_bucket.deployments.id

  target_bucket = aws_s3_bucket.logs.id
  target_prefix = "s3-access-logs/"
}
```

## Backup and Disaster Recovery

### 1. Enable S3 Versioning

Already enabled in the Terraform configuration.

### 2. Cross-Region Replication (Optional)

For critical deployments, replicate to another region:

```hcl
resource "aws_s3_bucket_replication_configuration" "replication" {
  bucket = aws_s3_bucket.deployments.id

  role = aws_iam_role.replication.arn

  rule {
    id     = "replicate-all"
    status = "Enabled"

    destination {
      bucket        = aws_s3_bucket.backup.arn
      storage_class = "STANDARD_IA"
    }
  }
}
```

### 3. Regular Backups

Terraform state:
```bash
terraform state pull > backup.tfstate
```

Database:
```bash
pg_dump deployment_platform > backup.sql
```

## Troubleshooting

### Certificate Validation Stuck

If ACM certificate validation is pending:
1. Check nameservers are correct
2. Wait up to 30 minutes
3. Verify DNS records in Route53

### S3 Bucket Already Exists

Change `project_name` in `terraform.tfvars` to make bucket names unique.

### Permission Denied Errors

Ensure IAM user has all required permissions.

### High Costs

Check:
- CloudFront data transfer
- S3 storage usage
- Number of requests

Use AWS Cost Explorer to identify issues.

## Support

For AWS-specific issues:
- [AWS Support](https://console.aws.amazon.com/support/)
- [AWS Documentation](https://docs.aws.amazon.com/)

For platform issues:
- [GitHub Issues](https://github.com/23blocks-OS/TheLandingPage-SaaS/issues)
