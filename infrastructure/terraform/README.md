# Terraform Infrastructure

This directory contains the Terraform configuration for deploying the 23Blocks Deployment Platform infrastructure on AWS.

## What Gets Created

- **S3 Buckets**:
  - Deployments bucket (stores all deployed sites)
  - Uploads bucket (temporary storage for uploads)

- **CloudFront**:
  - CDN distribution for fast global delivery
  - Origin Access Identity for secure S3 access
  - Custom error responses for SPA routing

- **Route53** (if domain provided):
  - Hosted zone for DNS management
  - Wildcard A record (*.yourdomain.com)

- **ACM Certificate** (if domain provided):
  - SSL/TLS certificate for HTTPS
  - Wildcard certificate (*.yourdomain.com)

- **IAM**:
  - Platform API user with programmatic access
  - Policies for S3, CloudFront, and Route53

- **DynamoDB** (optional):
  - Table for deployment tracking (alternative to PostgreSQL)

## Prerequisites

1. **AWS Account**: You need an AWS account with appropriate permissions
2. **Terraform**: Install Terraform >= 1.0
3. **AWS CLI**: Configured with credentials
4. **Domain Name** (optional): If you want custom domains

## Quick Start

### 1. Configure Variables

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your configuration:

```hcl
aws_region   = "us-east-1"
project_name = "23blocks-deploy"
domain_name  = "23blocks.net"  # Optional
```

### 2. Initialize Terraform

```bash
terraform init
```

### 3. Review the Plan

```bash
terraform plan
```

### 4. Apply Configuration

```bash
terraform apply
```

Review the changes and type `yes` to confirm.

### 5. Save Outputs

```bash
terraform output -json > outputs.json
```

**Important**: Save the AWS credentials from the output securely!

## Configuration Options

### Domain Configuration

**Option 1: Use Your Own Domain**

```hcl
domain_name = "23blocks.net"
```

This creates:
- `*.23blocks.net` wildcard certificate
- Route53 hosted zone
- Deployments accessible at `project1.23blocks.net`

**Option 2: Use CloudFront Domain**

```hcl
domain_name = ""
```

This uses CloudFront's default domain:
- Deployments accessible at `d111111abcdef8.cloudfront.net/project1/`

### Database Options

**Option 1: PostgreSQL** (Recommended)

```hcl
use_dynamodb = false
```

You'll need to provide your own PostgreSQL database.

**Option 2: DynamoDB**

```hcl
use_dynamodb = true
```

Terraform will create a DynamoDB table for you.

### Cost Optimization

```hcl
# Cheaper: US & Europe only
cloudfront_price_class = "PriceClass_100"

# Global distribution
cloudfront_price_class = "PriceClass_All"
```

## Post-Deployment Steps

### 1. Update Domain Nameservers

If you provided a domain name, update your domain registrar with the Route53 nameservers:

```bash
terraform output route53_name_servers
```

Copy these nameservers to your domain registrar (GoDaddy, Namecheap, etc.).

### 2. Get AWS Credentials

```bash
terraform output platform_api_access_key_id
terraform output platform_api_secret_access_key
```

**Save these securely!** You'll need them for the Next.js app.

### 3. Update Environment Variables

Copy the credentials to your Next.js app:

```bash
cd ../../apps/deployment-platform
cp .env.example .env.local
```

Add the Terraform outputs to `.env.local`.

## Updating Infrastructure

```bash
# Pull latest changes
git pull

# Review changes
terraform plan

# Apply updates
terraform apply
```

## Destroying Infrastructure

**Warning**: This will delete all deployments!

```bash
terraform destroy
```

## Estimated Costs

Monthly cost estimates (varies by usage):

- **S3**: $0.023/GB + $0.005/1000 requests
- **CloudFront**: $0.085/GB (first 10TB) + $0.01/10,000 requests
- **Route53**: $0.50/hosted zone + $0.40/million queries
- **DynamoDB**: $1.25/million writes + $0.25/million reads (pay-per-request)

**Estimated total**: $5-50/month depending on traffic

## Troubleshooting

### Certificate Validation Pending

If ACM certificate validation is stuck:

1. Check nameservers are correctly configured
2. Wait up to 30 minutes for DNS propagation
3. Verify DNS records in Route53

### S3 Bucket Already Exists

If bucket names conflict:

1. Change `project_name` in `terraform.tfvars`
2. Run `terraform apply` again

### Permission Denied

Ensure your AWS credentials have permissions for:
- S3 (CreateBucket, PutObject, etc.)
- CloudFront (CreateDistribution, etc.)
- Route53 (CreateHostedZone, etc.)
- ACM (RequestCertificate, etc.)
- IAM (CreateUser, CreatePolicy, etc.)

## Security Best Practices

1. **Credentials**: Never commit `.tfvars` files with credentials
2. **State**: Use remote state backend (S3) for production
3. **IAM**: Use least-privilege policies
4. **Encryption**: Enable S3 encryption at rest (optional)
5. **WAF**: Enable AWS WAF for DDoS protection (optional)

## Remote State (Production)

For production, use remote state:

```hcl
# In main.tf
backend "s3" {
  bucket = "your-terraform-state-bucket"
  key    = "deployment-platform/terraform.tfstate"
  region = "us-east-1"
  encrypt = true
}
```

## Support

- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS CloudFront Docs](https://docs.aws.amazon.com/cloudfront/)
- [AWS S3 Docs](https://docs.aws.amazon.com/s3/)
