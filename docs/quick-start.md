# Quick Start Guide
## Deploy Your First Site in 15 Minutes

This guide gets you up and running with 23Blocks Deploy as quickly as possible.

## Prerequisites

Before you begin, make sure you have:

- ✅ **AWS Account** with admin access
- ✅ **Node.js 18+** installed
- ✅ **pnpm 9+** installed (`npm install -g pnpm`)
- ✅ **Terraform 1.0+** installed
- ✅ **PostgreSQL** database (or use DynamoDB)
- ✅ **Domain name** (optional but recommended)

## Step 1: Clone the Repository (2 minutes)

```bash
git clone https://github.com/23blocks-OS/TheLandingPage-SaaS.git
cd TheLandingPage-SaaS
pnpm install
```

## Step 2: Deploy AWS Infrastructure (5 minutes)

```bash
cd infrastructure/terraform

# Copy the example configuration
cp terraform.tfvars.example terraform.tfvars

# Edit with your settings (use your favorite editor)
nano terraform.tfvars
```

**Minimal configuration**:
```hcl
aws_region   = "us-east-1"
project_name = "23blocks-deploy"
domain_name  = ""  # Leave empty to use CloudFront domain
```

**With custom domain**:
```hcl
aws_region   = "us-east-1"
project_name = "23blocks-deploy"
domain_name  = "yourdomain.com"  # Creates *.yourdomain.com
```

**Deploy the infrastructure**:
```bash
terraform init
terraform apply
```

Type `yes` when prompted.

**Save the outputs**:
```bash
terraform output -json > outputs.json
```

**IMPORTANT**: Copy the AWS credentials from the output. You'll need them next!

## Step 3: Configure the Platform (3 minutes)

```bash
cd ../../apps/deployment-platform

# Copy environment template
cp .env.example .env.local

# Edit with your settings
nano .env.local
```

**Required environment variables**:
```bash
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/deployment_platform"

# NextAuth Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# AWS Credentials (from Terraform output)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key-from-terraform"
AWS_SECRET_ACCESS_KEY="your-secret-key-from-terraform"

# S3 Buckets (from Terraform output)
S3_DEPLOYMENTS_BUCKET="23blocks-deploy-deployments-xxxxxxxx"
S3_UPLOADS_BUCKET="23blocks-deploy-uploads-xxxxxxxx"

# CloudFront (from Terraform output)
CLOUDFRONT_DISTRIBUTION_ID="E1234567890ABC"
CLOUDFRONT_DOMAIN="d111111abcdef8.cloudfront.net"

# Domain (if you configured one)
DOMAIN_NAME="yourdomain.com"  # or leave empty
USE_SUBDOMAINS="true"
```

## Step 4: Set Up Database (2 minutes)

**Create the database** (if not already created):
```bash
createdb deployment_platform
```

**Run migrations**:
```bash
pnpm prisma migrate dev
```

This creates all necessary tables.

## Step 5: Start the Platform (1 minute)

```bash
# From the root directory
cd ../..
pnpm dev
```

Visit **http://localhost:3000**

## Step 6: Create Your Account (1 minute)

1. Go to http://localhost:3000/register
2. Enter your email and password
3. Click "Create Account"
4. Login at http://localhost:3000/login

## Step 7: Create Your First Project (1 minute)

1. Click "New Project" in the dashboard
2. Enter a project name (e.g., "my-first-site")
3. Click "Create"
4. Note the project ID for deployment

## Step 8: Deploy a Site

### Option A: Using the Dashboard

1. Click on your project
2. Click "Upload Files"
3. Select your dist folder
4. Click "Deploy"
5. Wait for deployment to complete
6. Visit your live URL!

### Option B: Using the CLI (Recommended)

**Install the CLI**:
```bash
cd packages/deploy-cli
pnpm build
npm link
```

**Login**:
```bash
23blocks-deploy login
```

Enter your email and password.

**Deploy your site**:
```bash
# Navigate to your project
cd /path/to/your-project

# Build your site (example for React)
npm run build

# Deploy
23blocks-deploy deploy
```

The CLI will:
- Ask you to select a project (or specify with `-p project-id`)
- Upload all files from `./dist` (or specify with `-d ./build`)
- Deploy to S3 and CloudFront
- Give you a live URL!

## 🎉 You're Live!

Your site is now deployed at:
- **With custom domain**: `https://projectname.yourdomain.com`
- **Without domain**: `https://d111111abcdef8.cloudfront.net/projectname/`

## Next Steps

### Production Deployment

For production, you'll want to:

1. **Deploy the platform to a server**
   ```bash
   # Build for production
   pnpm build

   # Start with PM2
   pm2 start pnpm --name "23blocks-deploy" -- start
   ```

2. **Set up a reverse proxy** (Nginx/Caddy)

3. **Enable SSL** for your platform domain

4. **Update nameservers** (if using custom domain)
   - Copy Route53 nameservers from Terraform output
   - Update at your domain registrar
   - Wait 24-48 hours for DNS propagation

### Useful Commands

```bash
# View all projects
23blocks-deploy projects

# Create a new project
23blocks-deploy create-project -n "project-name"

# Deploy to specific project
23blocks-deploy deploy -p project-id

# Deploy from custom directory
23blocks-deploy deploy -d ./build

# Check who you're logged in as
23blocks-deploy whoami

# Logout
23blocks-deploy logout
```

### Monitoring

- **AWS Console**: Monitor S3, CloudFront, and costs
- **Database**: Check deployment records in PostgreSQL
- **Logs**: View application logs for debugging

### Backup

```bash
# Backup database
pg_dump deployment_platform > backup.sql

# Backup Terraform state
terraform state pull > terraform-state-backup.json
```

## Common Issues

### Database Connection Error

**Problem**: "Can't connect to database"

**Solution**:
```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql $DATABASE_URL
```

### AWS Permission Error

**Problem**: "Access Denied" when uploading to S3

**Solution**:
- Verify AWS credentials in `.env.local`
- Check IAM user has correct permissions
- Ensure bucket names match Terraform output

### Port Already in Use

**Problem**: "Port 3000 is already in use"

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 pnpm dev
```

### Deployment Not Showing

**Problem**: Files uploaded but site not showing

**Solution**:
- Check CloudFront distribution is deployed (takes 5-15 minutes initially)
- Verify S3 bucket has files
- Check browser console for errors
- Try invalidating CloudFront cache

## Getting Help

- 📖 **Documentation**: [Full Setup Guide](./setup.md)
- 💬 **Discord**: Join our community
- 🐛 **Issues**: [GitHub Issues](https://github.com/23blocks-OS/TheLandingPage-SaaS/issues)
- 📧 **Email**: support@23blocks.net

## Cost Estimate

Monthly costs (for reference):
- Platform: **$0** (self-hosted)
- S3 Storage: **~$5**
- CloudFront: **~$10-15**
- PostgreSQL: **~$15** (managed)
- Server: **~$10-20** (DigitalOcean/Linode)

**Total: ~$40-55/month** for unlimited deployments

Compare to:
- Netlify Pro: **$118/month**
- Vercel Pro: **$150/month**

**Savings: ~$75-110/month** 🎉

## What's Next?

- Read the [AWS Setup Guide](./aws-setup.md) for advanced configuration
- Check out [Self-Hosting Guide](./self-hosting.md) for production deployment
- Join the community to share your projects
- Star the repo on GitHub ⭐

---

**Congratulations! You've successfully deployed your first site with 23Blocks Deploy!** 🚀

Now go build something amazing!
