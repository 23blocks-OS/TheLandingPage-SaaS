# Demo Video Script
## 23Blocks Deploy - 5-Minute Product Demo

**Duration**: 5 minutes
**Format**: Screen recording with voiceover
**Style**: Professional, technical, fast-paced
**Resolution**: 1920x1080 (1080p)

---

## Pre-Production Checklist

### Recording Setup
- [ ] Clean desktop (no personal files visible)
- [ ] Close unnecessary apps
- [ ] Prepare test project (simple React app)
- [ ] Have terminal ready with clean history
- [ ] Browser with no personal bookmarks showing
- [ ] Good microphone and quiet room
- [ ] Script printed or on second monitor

### Demo Environment
- [ ] Fresh AWS account or clean demo account
- [ ] Test domain configured (demo.23blocks.net)
- [ ] Database ready
- [ ] All credentials prepared
- [ ] Test deployment files ready

### Software Needed
- [ ] Screen recording: OBS Studio / Camtasia / ScreenFlow
- [ ] Video editing: DaVinci Resolve / Final Cut / Premiere
- [ ] Thumbnail design: Canva / Figma

---

## Video Script

### INTRO (0:00 - 0:30) - 30 seconds

**[SCREEN: GitHub Pages landing site - docs site]**

**VOICEOVER**:
"Ever wished you could deploy like Netlify but own your infrastructure like AWS? Meet 23Blocks Deploy - an open-source deployment platform that gives you the best of both worlds."

**[SCREEN: Quick stats overlay]**
- ✅ Open Source (MIT)
- ✅ Self-Hosted
- ✅ $30/month vs $100+
- ✅ Your Infrastructure

**VOICEOVER**:
"In the next 5 minutes, I'll show you how to set up your own deployment platform and deploy your first site."

**[TRANSITION: Zoom into terminal]**

---

### PART 1: INFRASTRUCTURE SETUP (0:30 - 1:30) - 60 seconds

**[SCREEN: Terminal - clean prompt]**

**VOICEOVER**:
"First, let's deploy the AWS infrastructure. We use Terraform to handle all the complexity - S3, CloudFront, Route53, SSL certificates, everything."

**[TYPE - show actual commands]**:
```bash
git clone https://github.com/23blocks-OS/TheLandingPage-SaaS.git
cd TheLandingPage-SaaS/infrastructure/terraform
```

**[SCREEN: Open terraform.tfvars.example in VS Code]**

**VOICEOVER**:
"Copy the example config and add your AWS region and domain."

**[SHOW: Quick edit of terraform.tfvars]**:
```hcl
aws_region   = "us-east-1"
project_name = "23blocks-deploy"
domain_name  = "demo.23blocks.net"
```

**[SCREEN: Back to terminal]**

**VOICEOVER**:
"Now deploy the infrastructure with two commands."

**[TYPE]**:
```bash
terraform init
terraform apply -auto-approve
```

**[SCREEN: Speed up terraform output - show 2-3 seconds of scrolling]**

**[OVERLAY TEXT: "Takes ~5 minutes - sped up for demo"]**

**[SCREEN: Show terraform output with AWS credentials]**

**VOICEOVER**:
"Terraform creates everything and gives us the AWS credentials we need. Copy these."

---

### PART 2: PLATFORM SETUP (1:30 - 2:30) - 60 seconds

**[SCREEN: Terminal - new tab]**

**VOICEOVER**:
"Next, configure the platform. Copy the environment template and add our AWS credentials."

**[TYPE]**:
```bash
cd ../../apps/deployment-platform
cp .env.example .env.local
```

**[SCREEN: VS Code - .env.local file]**

**VOICEOVER**:
"Paste the AWS credentials from Terraform, add your database URL, and generate a secret."

**[SHOW: Quick edits - maybe speed up slightly]**:
```bash
DATABASE_URL="postgresql://..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
S3_DEPLOYMENTS_BUCKET="..."
```

**[SCREEN: Back to terminal]**

**VOICEOVER**:
"Install dependencies, run database migrations, and start the platform."

**[TYPE]**:
```bash
pnpm install
pnpm prisma migrate dev
pnpm dev
```

**[SCREEN: Show server starting - "ready on port 3000"]**

---

### PART 3: DASHBOARD TOUR (2:30 - 3:15) - 45 seconds

**[SCREEN: Browser - localhost:3000]**

**VOICEOVER**:
"The platform is running. Let's create an account."

**[SHOW: Register page - quick signup]**
- Enter email: demo@23blocks.net
- Enter password
- Click "Create Account"

**[SCREEN: Login and redirect to dashboard]**

**VOICEOVER**:
"Once logged in, you see your dashboard. Let's create a project."

**[CLICK: "New Project" button]**

**[MODAL: Create project form]**
- Name: "my-first-site"
- Description: "Demo deployment"
- Click "Create"

**[SCREEN: Dashboard with new project card]**

**VOICEOVER**:
"Great! Now we have a project ready to deploy to."

---

### PART 4: CLI DEPLOYMENT (3:15 - 4:30) - 75 seconds

**[SCREEN: Terminal - new tab]**

**VOICEOVER**:
"For deployments, we use the CLI. It's simple. Install it, login, and deploy."

**[TYPE]**:
```bash
npm install -g @23blocks/deploy-cli
23blocks-deploy login
```

**[SCREEN: Show login prompt]**
- Email: demo@23blocks.net
- Password: ***********
- ✅ Logged in successfully

**[SCREEN: Navigate to example project]**

**VOICEOVER**:
"I have a simple React app here. Let's build and deploy it."

**[TYPE]**:
```bash
npm run build
23blocks-deploy deploy
```

**[SCREEN: CLI shows project selection]**
- Select: "my-first-site"

**[SCREEN: Upload progress]**
- Preparing files... ✓
- Found 12 files
- Uploading files... [progress bar]
- Deployment complete! ✓

**[SHOW: Output with live URL]**:
```
✅ Your site is live!
   https://my-first-site.demo.23blocks.net

   Deployment ID: abc123
```

**[SCREEN: Open browser to that URL]**

**VOICEOVER**:
"And just like that, our site is live with automatic SSL, CloudFront CDN, and a custom subdomain."

**[SHOW: The deployed React app loading and working]**

---

### PART 5: DASHBOARD REVIEW (4:30 - 4:50) - 20 seconds

**[SCREEN: Back to dashboard - refresh]**

**VOICEOVER**:
"Back in the dashboard, we can see our deployment with all the details."

**[SHOW: Project card with deployment info]**
- Status: READY (green)
- Files: 12
- Size: 234 KB
- Deployed: Just now

**[CLICK: "View Site" button - opens in new tab]**

**[SHOW: Site loading again]**

---

### OUTRO (4:50 - 5:00) - 10 seconds

**[SCREEN: Split screen - dashboard on left, site on right]**

**VOICEOVER**:
"That's 23Blocks Deploy. Open source, self-hosted, and yours to control."

**[SCREEN: Fade to end card]**

**END CARD** (show for 5 seconds):
```
🚀 23Blocks Deploy

✅ Open Source (MIT License)
✅ Self-Hosted on Your AWS
✅ ~$30/month for unlimited sites

Get Started:
github.com/23blocks-OS/TheLandingPage-SaaS
docs.23blocks.net

⭐ Star on GitHub
```

---

## Recording Tips

### Voice-over Guidelines
- **Pace**: Medium-fast (140-160 words/minute)
- **Tone**: Enthusiastic but professional
- **Energy**: High energy, excited about the product
- **Clarity**: Enunciate clearly, pause between sections

### Screen Recording
- **Resolution**: 1920x1080 (1080p minimum)
- **Frame Rate**: 60fps for smooth cursor movement
- **Cursor**: Make cursor larger and visible
- **Zoom**: Zoom in on important text (credentials, URLs)
- **Speed**: Speed up long waits (terraform, npm install)

### Editing Guidelines
- Cut dead time (waiting for commands)
- Add zoom effects for important text
- Add callout boxes for key information
- Keep transitions smooth
- Add background music (soft, non-intrusive)
- Add captions for accessibility

---

## B-Roll Shots (Optional)

If you want to make it more polished, add these shots:

1. **Architecture Diagram** (custom graphic)
   - Show: User → CLI → Next.js → S3 → CloudFront → User

2. **Cost Comparison Chart** (animated)
   - Netlify: $118/mo
   - Vercel: $150/mo
   - 23Blocks: $30/mo

3. **Feature Checklist** (animated)
   - ✓ One-command deployments
   - ✓ Automatic SSL
   - ✓ CloudFront CDN
   - ✓ Custom domains

---

## Thumbnail Design

**Dimensions**: 1280x720 (16:9)

**Design Elements**:
- Background: Gradient (purple to blue)
- Large text: "Deploy Like Netlify"
- Subtext: "Own Like AWS"
- Logo: 23Blocks rocket icon
- Badge: "Open Source"
- Price comparison: "$30/mo vs $118/mo"

**Tools**: Canva, Figma, Photoshop

---

## Video Platforms

Upload to:
1. **YouTube** (primary)
   - Title: "23Blocks Deploy - Open Source Deployment Platform (Like Netlify, Self-Hosted)"
   - Description: [see below]
   - Tags: deployment, netlify, vercel, aws, open source, self-hosted
   - Category: Science & Technology

2. **Twitter/X** (short clip)
   - 30-second highlight clip
   - Focus on deployment part

3. **LinkedIn** (professional version)
   - Upload directly (better engagement than YouTube link)

---

## YouTube Video Description Template

```
🚀 23Blocks Deploy - Open Source, Self-Hosted Deployment Platform

Deploy your static sites like Netlify or Vercel, but on your own AWS infrastructure.

⏱️ TIMESTAMPS:
0:00 - Introduction
0:30 - Infrastructure Setup (Terraform)
1:30 - Platform Configuration
2:30 - Dashboard Tour
3:15 - CLI Deployment
4:30 - Dashboard Review
4:50 - Outro

💡 WHAT IS 23BLOCKS DEPLOY?

An open-source deployment platform that you can host on your own AWS account.
Get the simplicity of Netlify with the control and cost-efficiency of self-hosting.

✨ FEATURES:
✅ One-command deployments
✅ Automatic SSL/TLS certificates
✅ CloudFront CDN
✅ Custom subdomains
✅ Web dashboard
✅ CLI tool
✅ Open source (MIT)

💰 COST COMPARISON:
• Netlify Pro: $118/month
• Vercel Pro: $150/month
• 23Blocks Deploy: ~$30/month AWS costs

For unlimited deployments!

🔗 LINKS:
• GitHub: https://github.com/23blocks-OS/TheLandingPage-SaaS
• Documentation: https://docs.23blocks.net
• Quick Start: https://docs.23blocks.net/quick-start

🛠️ TECH STACK:
• Infrastructure: Terraform + AWS (S3, CloudFront, Route53)
• Platform: Next.js 14, Prisma, PostgreSQL
• CLI: Node.js, TypeScript

🎯 PERFECT FOR:
• Dev agencies hosting multiple client sites
• Solo developers with many projects
• Privacy-conscious teams
• Cost-conscious startups

⭐ If you find this useful, please star the repo on GitHub!

#deployment #aws #netlify #vercel #opensource #selfhosted #webdev #nextjs

---

Want to contribute? Check out our GitHub repo!
Questions? Join our Discord community (link in repo)
```

---

## Alternative: Quick 2-Minute Version

If you want a shorter version for social media:

**STRUCTURE** (2:00 total):
- 0:00-0:15: Intro (problem/solution)
- 0:15-0:45: Quick infrastructure setup (Terraform)
- 0:45-1:15: Deploy a site (CLI only)
- 1:15-1:45: Show live site and dashboard
- 1:45-2:00: Outro (CTA)

Cut out:
- Detailed configuration
- Dashboard deep dive
- Keep only essential steps

---

## Post-Production Checklist

Before publishing:
- [ ] Check audio levels (consistent volume)
- [ ] Add captions/subtitles
- [ ] Test on mobile (is text readable?)
- [ ] Verify all URLs are correct
- [ ] Add cards (YouTube annotations)
- [ ] Add end screen (subscribe button, next video)
- [ ] Create 3 thumbnail options (A/B test)
- [ ] Write compelling title (under 60 chars)
- [ ] SEO-optimize description
- [ ] Add to playlists (if applicable)

---

## Distribution Strategy

**Week 1**:
- Upload to YouTube
- Post on Twitter with clip
- Share on LinkedIn
- Embed on docs site
- Add to Product Hunt listing

**Week 2+**:
- Add to README
- Share in Discord communities
- Post in relevant subreddits
- Include in newsletter
- Add to blog posts

---

## Success Metrics

Track:
- Views (target: 1,000+ in first month)
- Watch time (target: 50%+ average)
- Click-through rate on links (target: 5%+)
- GitHub stars from video traffic
- Conversion to signups

---

Good luck with the recording! Remember: Don't aim for perfection on the first take. Record multiple times if needed, and edit together the best parts.
