# Setup Guide

This guide will walk you through setting up the 23Blocks Deployment Platform from scratch.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ and **pnpm** 9+
- **AWS Account** with appropriate permissions
- **PostgreSQL** database (or use DynamoDB)
- **Domain name** (optional, but recommended)
- **Terraform** 1.0+ installed

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/23blocks-OS/TheLandingPage-SaaS.git
cd TheLandingPage-SaaS
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install dependencies for all packages in the monorepo.

### 3. Set Up AWS Infrastructure

Navigate to the Terraform directory:

```bash
cd infrastructure/terraform
```

Create your configuration file:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your settings:

```hcl
aws_region   = "us-east-1"
project_name = "23blocks-deploy"
domain_name  = "yourdomain.com"  # Optional
```

Initialize and apply Terraform:

```bash
terraform init
terraform plan
terraform apply
```

**Important**: Save the output values, especially:
- AWS credentials (access key and secret)
- S3 bucket names
- CloudFront distribution ID

If using a custom domain, update your domain registrar's nameservers with the Route53 nameservers from the Terraform output.

### 4. Set Up Database

#### Option A: PostgreSQL (Recommended)

Create a PostgreSQL database:

```bash
createdb deployment_platform
```

Or use a managed service like:
- AWS RDS
- DigitalOcean Managed Database
- Supabase
- Neon

#### Option B: DynamoDB

If you set `use_dynamodb = true` in Terraform, the DynamoDB table is already created.

### 5. Configure the Web Platform

Navigate to the Next.js app:

```bash
cd apps/deployment-platform
```

Create environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with values from Terraform output:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/deployment_platform"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# AWS (from Terraform output)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"

# S3 Buckets (from Terraform output)
S3_DEPLOYMENTS_BUCKET="23blocks-deploy-deployments-xxxxxxxx"
S3_UPLOADS_BUCKET="23blocks-deploy-uploads-xxxxxxxx"

# CloudFront (from Terraform output)
CLOUDFRONT_DISTRIBUTION_ID="E1234567890ABC"
CLOUDFRONT_DOMAIN="d111111abcdef8.cloudfront.net"

# Domain (if you have one)
DOMAIN_NAME="yourdomain.com"
USE_SUBDOMAINS="true"
```

Generate a secure secret:

```bash
openssl rand -base64 32
```

### 6. Run Database Migrations

```bash
pnpm prisma migrate dev
```

This creates all necessary database tables.

### 7. Start the Development Server

From the root directory:

```bash
pnpm dev
```

Or just the platform:

```bash
pnpm platform:dev
```

Visit http://localhost:3000

### 8. Create Your First Account

1. Go to http://localhost:3000/register
2. Create an account
3. Login at http://localhost:3000/login
4. Create your first project

### 9. Install the CLI

Build and link the CLI:

```bash
cd packages/deploy-cli
pnpm build
npm link
```

Or install globally from npm (when published):

```bash
npm install -g @23blocks/deploy-cli
```

### 10. Deploy Your First Site

```bash
# Login
23blocks-deploy login

# Create a project
23blocks-deploy create-project -n "my-site"

# Deploy (from your project's dist folder)
cd your-project
npm run build
23blocks-deploy deploy
```

## Production Deployment

### 1. Deploy to a Server

#### Using Docker

Create a `Dockerfile` in `apps/deployment-platform`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY apps/deployment-platform ./apps/deployment-platform

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

RUN cd apps/deployment-platform && pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

Build and run:

```bash
docker build -t 23blocks-deploy .
docker run -p 3000:3000 --env-file .env.local 23blocks-deploy
```

#### Using PM2

```bash
pnpm build
pm2 start pnpm --name "23blocks-deploy" -- start
```

### 2. Configure Reverse Proxy

#### Nginx

```nginx
server {
    listen 80;
    server_name deploy.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Caddy

```
deploy.yourdomain.com {
    reverse_proxy localhost:3000
}
```

### 3. Enable SSL

Use Let's Encrypt with Certbot:

```bash
sudo certbot --nginx -d deploy.yourdomain.com
```

Or with Caddy (automatic):

```
deploy.yourdomain.com {
    reverse_proxy localhost:3000
}
```

### 4. Set Production Environment Variables

Update `.env.local` with production values:

```bash
NEXTAUTH_URL="https://deploy.yourdomain.com"
NODE_ENV="production"
```

## Troubleshooting

### Database Connection Issues

Check your `DATABASE_URL` format:
```
postgresql://username:password@host:port/database
```

Test connection:
```bash
pnpm prisma db push
```

### AWS Permission Errors

Ensure your IAM user has:
- S3 full access
- CloudFront invalidation permissions
- Route53 record management (if using custom domain)

### Build Errors

Clear cache and rebuild:
```bash
pnpm clean
pnpm install
pnpm build
```

### Port Already in Use

Change the port in `package.json`:
```json
"dev": "next dev -p 3001"
```

## Next Steps

- [AWS Configuration Guide](./aws-setup.md)
- [CLI Usage Guide](../packages/deploy-cli/README.md)
- [API Reference](./api.md)
- [Self-Hosting Guide](./self-hosting.md)

## Support

Need help? Open an issue on [GitHub](https://github.com/23blocks-OS/TheLandingPage-SaaS/issues).
