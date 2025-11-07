# Self-Hosting Guide

This guide covers deploying and managing your own instance of the 23Blocks Deployment Platform.

## Why Self-Host?

- **Full Control**: You own the infrastructure
- **Custom Domains**: Use your own domain
- **Privacy**: Keep data on your infrastructure
- **Cost Savings**: Pay only for AWS resources
- **White Label**: Rebrand for your agency

## Deployment Options

### Option 1: Traditional Server

Best for: Small teams, development

**Requirements:**
- Linux server (Ubuntu 20.04+ recommended)
- 2GB+ RAM
- Node.js 18+
- PostgreSQL 13+
- Nginx/Caddy

**Steps:**

1. Clone repository:
```bash
git clone https://github.com/23blocks-OS/TheLandingPage-SaaS.git
cd TheLandingPage-SaaS
```

2. Install dependencies:
```bash
npm install -g pnpm
pnpm install
```

3. Set up database:
```bash
sudo -u postgres createdb deployment_platform
```

4. Configure environment:
```bash
cd apps/deployment-platform
cp .env.example .env.local
# Edit .env.local with your settings
```

5. Run migrations:
```bash
pnpm prisma migrate deploy
```

6. Build:
```bash
pnpm build
```

7. Start with PM2:
```bash
npm install -g pm2
pm2 start pnpm --name "23blocks-deploy" -- start
pm2 save
pm2 startup
```

### Option 2: Docker

Best for: Easy deployment, containerized environments

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/deployment_platform
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - S3_DEPLOYMENTS_BUCKET=${S3_DEPLOYMENTS_BUCKET}
      - S3_UPLOADS_BUCKET=${S3_UPLOADS_BUCKET}
      - CLOUDFRONT_DISTRIBUTION_ID=${CLOUDFRONT_DISTRIBUTION_ID}
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=deployment_platform
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run:
```bash
docker-compose up -d
```

### Option 3: Kubernetes

Best for: High availability, scale

**deployment.yaml:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: 23blocks-deploy
spec:
  replicas: 3
  selector:
    matchLabels:
      app: 23blocks-deploy
  template:
    metadata:
      labels:
        app: 23blocks-deploy
    spec:
      containers:
      - name: app
        image: your-registry/23blocks-deploy:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: deploy-secrets
              key: database-url
        - name: AWS_ACCESS_KEY_ID
          valueFrom:
            secretKeyRef:
              name: aws-credentials
              key: access-key-id
```

### Option 4: Serverless (Vercel/Netlify)

Best for: Quick deployment, zero maintenance

**Note**: You'll still need AWS for S3 and CloudFront.

Deploy to Vercel:
```bash
vercel --prod
```

Deploy to Netlify:
```bash
netlify deploy --prod
```

## Infrastructure Setup

### 1. AWS Configuration

See [AWS Setup Guide](./aws-setup.md) for detailed instructions.

Quick setup:
```bash
cd infrastructure/terraform
terraform init
terraform apply
```

### 2. Database Setup

#### PostgreSQL

**Self-hosted:**
```bash
sudo apt install postgresql
sudo -u postgres createdb deployment_platform
```

**Managed Services:**
- AWS RDS
- DigitalOcean Database
- Supabase
- Neon

#### DynamoDB (Alternative)

Set in `terraform.tfvars`:
```hcl
use_dynamodb = true
```

### 3. Domain Configuration

#### Setup DNS

Point your domain to your server:
```
A    deploy.yourdomain.com    123.45.67.89
```

#### Wildcard for Deployments

```
A    *.deploy.yourdomain.com    [CloudFront IP]
```

Or use CNAME:
```
CNAME *.deploy.yourdomain.com  d123.cloudfront.net
```

## Customization

### 1. Branding

Edit `apps/deployment-platform/src/app/page.tsx`:

```tsx
// Change logo
<Rocket className="h-8 w-8 text-primary-600" />
// to
<YourLogo className="h-8 w-8" />

// Change title
"23Blocks Deploy"
// to
"Your Company Deploy"
```

### 2. Email Configuration

Add SMTP settings in `.env.local`:

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@yourdomain.com"
```

### 3. Authentication

#### Disable Signup

```bash
ENABLE_SIGNUP="false"
```

#### Add GitHub OAuth

```bash
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
```

### 4. Upload Limits

```bash
MAX_UPLOAD_SIZE="104857600"  # 100MB
```

## Monitoring

### 1. Application Monitoring

#### Sentry

```bash
npm install @sentry/nextjs

# Add to next.config.js
const { withSentryConfig } = require('@sentry/nextjs')
```

#### LogRocket

```bash
npm install logrocket
```

### 2. Infrastructure Monitoring

#### CloudWatch

AWS resources are automatically monitored in CloudWatch.

#### Uptime Monitoring

Use:
- UptimeRobot
- Pingdom
- StatusCake

### 3. Error Tracking

Set up alerts for:
- Failed deployments
- S3 upload errors
- Database connection issues
- High memory/CPU usage

## Backup Strategy

### 1. Database Backups

Automated PostgreSQL backups:

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump deployment_platform > /backups/db_$DATE.sql
aws s3 cp /backups/db_$DATE.sql s3://your-backup-bucket/

# Add to crontab
0 2 * * * /path/to/backup.sh
```

### 2. Terraform State

Store Terraform state remotely:

```hcl
backend "s3" {
  bucket = "your-terraform-state-bucket"
  key    = "deployment-platform/terraform.tfstate"
  region = "us-east-1"
  encrypt = true
}
```

### 3. Application Code

Use git and regular pushes to GitHub/GitLab.

## Scaling

### 1. Horizontal Scaling

Run multiple app instances behind a load balancer.

**Nginx upstream:**
```nginx
upstream deploy_backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    location / {
        proxy_pass http://deploy_backend;
    }
}
```

### 2. Database Scaling

- Enable read replicas
- Use connection pooling (PgBouncer)
- Consider database sharding

### 3. CDN Optimization

CloudFront is already optimized, but you can:
- Increase cache TTL
- Use edge locations strategically
- Enable compression

## Security Hardening

### 1. SSL/TLS

Use Let's Encrypt:
```bash
sudo certbot --nginx -d deploy.yourdomain.com
```

### 2. Firewall

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 3. Rate Limiting

Add to Nginx:
```nginx
limit_req_zone $binary_remote_addr zone=deploy:10m rate=10r/s;

location /api/ {
    limit_req zone=deploy burst=20;
}
```

### 4. Environment Secrets

Never commit `.env.local` to git.

Use:
- AWS Secrets Manager
- HashiCorp Vault
- Environment variables

### 5. Database Security

- Use strong passwords
- Enable SSL connections
- Restrict IP access
- Regular security updates

## Maintenance

### 1. Updates

```bash
git pull origin main
pnpm install
pnpm build
pm2 restart 23blocks-deploy
```

### 2. Database Migrations

```bash
pnpm prisma migrate deploy
```

### 3. Log Rotation

Configure logrotate:
```
/var/log/23blocks-deploy/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
}
```

## Troubleshooting

### High Memory Usage

Check and restart:
```bash
pm2 monit
pm2 restart 23blocks-deploy
```

### Database Connection Issues

Test connection:
```bash
psql $DATABASE_URL
```

### AWS Permission Errors

Verify IAM policies in AWS console.

### DNS Issues

Check DNS propagation:
```bash
dig yourdomain.com
nslookup yourdomain.com
```

## Cost Management

### Monthly Estimates

**Minimal setup:**
- Server: $5-20 (DigitalOcean, Linode)
- Database: $15 (managed PostgreSQL)
- AWS: $10-30 (S3 + CloudFront)
- Domain: $10-15/year
**Total: ~$30-65/month**

**Production setup:**
- Servers: $50-100 (load balanced)
- Database: $50-100 (RDS)
- AWS: $50-200 (higher traffic)
**Total: ~$150-400/month**

### Cost Optimization

1. Use reserved instances for long-term servers
2. Enable S3 lifecycle policies
3. Use CloudFront PriceClass_100
4. Monitor and set budget alerts

## Support

For self-hosting support:
- [GitHub Discussions](https://github.com/23blocks-OS/TheLandingPage-SaaS/discussions)
- [Documentation](https://docs.23blocks.net)

For infrastructure issues:
- [AWS Support](https://console.aws.amazon.com/support/)
