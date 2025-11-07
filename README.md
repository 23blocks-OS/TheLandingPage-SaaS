# 23Blocks Deployment Platform

An open-source, self-hostable deployment platform for static sites - like Netlify or Vercel, but you control the infrastructure.

## 🚀 Features

- **Upload & Deploy**: Upload your dist folder and get instant hosting
- **Custom Subdomains**: Each deployment gets a unique URL (e.g., `user1.app1.23blocks.net`)
- **S3 + CloudFront**: Fast, reliable hosting with CDN
- **Self-Hostable**: Bring your own AWS keys and run it yourself
- **Open Source**: Free for everyone to use and modify
- **CLI Tool**: Simple publish command to deploy from terminal
- **Web Dashboard**: Manage all your deployments in one place

## 📦 What's Inside

This monorepo includes:

- `apps/deployment-platform` - Next.js web dashboard
- `packages/deploy-cli` - CLI tool for publishing sites
- `infrastructure/terraform` - AWS infrastructure as code

## 🏗️ Architecture

```
User uploads dist folder
    ↓
Next.js API receives files
    ↓
Creates S3 bucket (or uses existing)
    ↓
Uploads files to S3
    ↓
CloudFront CDN serves files
    ↓
User accesses site at subdomain
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Infrastructure**: AWS (S3, CloudFront, Route53, Lambda)
- **IaC**: Terraform
- **Database**: PostgreSQL (configurable)
- **Storage**: AWS S3

## 📋 Prerequisites

- Node.js 18+
- pnpm 9+
- AWS Account (for self-hosting)
- PostgreSQL database
- Domain name for hosting

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/23blocks-OS/TheLandingPage-SaaS.git
cd TheLandingPage-SaaS
pnpm install
```

### 2. Set Up Infrastructure

```bash
cd infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your AWS credentials and domain

terraform init
terraform plan
terraform apply
```

### 3. Configure Environment

```bash
cd apps/deployment-platform
cp .env.example .env.local
# Edit .env.local with your database and AWS credentials
```

### 4. Run Database Migrations

```bash
cd apps/deployment-platform
pnpm prisma migrate dev
```

### 5. Start Development

```bash
# From root directory
pnpm dev
```

Visit `http://localhost:3000` to see the dashboard.

## 📤 Publishing a Site

### Using the CLI

```bash
# Install CLI globally
pnpm install -g @23blocks/deploy-cli

# Login
23blocks-deploy login

# Publish your site
cd your-project/dist
23blocks-deploy publish
```

### Using the Web Dashboard

1. Login to your dashboard
2. Click "New Deployment"
3. Upload your dist folder
4. Get your live URL!

## 🔧 Configuration

### Environment Variables

See `apps/deployment-platform/.env.example` for all required environment variables.

### AWS Permissions

The platform requires the following AWS permissions:
- S3: Full access for bucket creation and file uploads
- CloudFront: Create and manage distributions
- Route53: Manage DNS records for subdomains
- Lambda: (Optional) For edge functions

## 🎯 Use Cases

- **Dev Agencies**: Host client sites on your own infrastructure
- **Solo Developers**: Deploy personal projects without vendor lock-in
- **Startups**: Build your own hosting platform
- **Enterprise**: Full control over deployment infrastructure

## 📖 Documentation

- [Setup Guide](./docs/setup.md)
- [AWS Configuration](./docs/aws-setup.md)
- [CLI Usage](./packages/deploy-cli/README.md)
- [API Reference](./docs/api.md)
- [Self-Hosting Guide](./docs/self-hosting.md)

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Inspired by Netlify and Vercel, built for the open-source community.

## 💬 Support

- GitHub Issues: For bugs and feature requests
- Discussions: For questions and community support

---

Built with ❤️ by 23Blocks
