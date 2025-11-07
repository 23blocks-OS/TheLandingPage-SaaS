# Analytics Setup Guide
## Google Analytics 4, PostHog, and Tracking Configuration

This guide shows you how to set up comprehensive analytics for the 23Blocks Deploy platform and documentation site.

---

## Analytics Stack

We'll set up:
1. **Google Analytics 4** - Website and user behavior
2. **PostHog** - Product analytics and feature flags
3. **GitHub Insights** - Repository metrics
4. **AWS CloudWatch** - Infrastructure monitoring

---

## 1. Google Analytics 4 Setup

### Step 1: Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Admin" (bottom left)
3. Click "Create Property"
4. Fill in:
   - Property name: "23Blocks Deploy"
   - Time zone: Your time zone
   - Currency: USD
5. Click "Next"
6. Fill in business details
7. Click "Create"
8. Accept Terms of Service

### Step 2: Create Data Streams

**For Documentation Site**:
1. Click "Add stream" → "Web"
2. Website URL: `https://23blocks-os.github.io`
3. Stream name: "Documentation Site"
4. Enable "Enhanced measurement"
5. Click "Create stream"
6. **Copy the Measurement ID** (format: G-XXXXXXXXXX)

**For Platform** (when deployed):
1. Click "Add stream" → "Web"
2. Website URL: `https://deploy.yourdomain.com`
3. Stream name: "Platform App"
4. Enable "Enhanced measurement"
5. Click "Create stream"
6. **Copy the Measurement ID**

### Step 3: Add to Documentation Site

Edit `docs/index.html` and add before `</head>`:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID.

### Step 4: Add to Next.js Platform

Create `apps/deployment-platform/src/lib/analytics.ts`:

```typescript
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || ''

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
  }
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }: {
  action: string
  category: string
  label: string
  value?: number
}) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Custom hook for tracking page views
export function useAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      pageview(pathname + searchParams.toString())
    }
  }, [pathname, searchParams])
}
```

Add to `apps/deployment-platform/src/app/layout.tsx`:

```tsx
import Script from 'next/script'
import { GA_TRACKING_ID } from '@/lib/analytics'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        {GA_TRACKING_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_TRACKING_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body>{children}</body>
    </html>
  )
}
```

Add to `.env.local`:
```bash
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

### Step 5: Track Custom Events

Track important actions:

```typescript
// In your components
import { event } from '@/lib/analytics'

// Track deployment
event({
  action: 'deploy',
  category: 'Deployment',
  label: 'CLI Deploy',
  value: 1
})

// Track project creation
event({
  action: 'create_project',
  category: 'Project',
  label: projectName,
  value: 1
})

// Track signup
event({
  action: 'signup',
  category: 'User',
  label: 'Email Signup',
  value: 1
})
```

---

## 2. PostHog Setup

PostHog is better for product analytics, feature flags, and session replays.

### Step 1: Create PostHog Account

1. Go to [PostHog Cloud](https://app.posthog.com/signup)
2. Sign up (free tier: 1M events/month)
3. Create new project: "23Blocks Deploy"
4. Copy your **Project API Key** and **Host URL**

### Step 2: Install PostHog

```bash
cd apps/deployment-platform
pnpm add posthog-js posthog-node
```

### Step 3: Configure PostHog Client

Create `apps/deployment-platform/src/lib/posthog.ts`:

```typescript
import posthog from 'posthog-js'

export const initPostHog = () => {
  if (typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || '', {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug()
      },
      capture_pageview: true,
      capture_pageleave: true,
    })
  }
}

export { posthog }
```

### Step 4: Initialize in Layout

Add to `apps/deployment-platform/src/app/layout.tsx`:

```tsx
'use client'

import { useEffect } from 'react'
import { initPostHog } from '@/lib/posthog'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog()
  }, [])

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

### Step 5: Track Events

```typescript
import { posthog } from '@/lib/posthog'

// Identify user
posthog.identify(userId, {
  email: user.email,
  name: user.name,
})

// Track events
posthog.capture('deployment_created', {
  projectId: project.id,
  fileCount: files.length,
  totalSize: totalSize,
})

posthog.capture('project_created', {
  projectName: project.name,
  subdomain: project.subdomain,
})

// Feature flags
const showNewFeature = posthog.isFeatureEnabled('new-dashboard')
```

Add to `.env.local`:
```bash
NEXT_PUBLIC_POSTHOG_KEY="phc_xxxxxxxxxxxxxxxxxxxxxx"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

---

## 3. GitHub Insights

GitHub provides built-in analytics for repositories.

### Access GitHub Insights

1. Go to your repository
2. Click "Insights" tab
3. Explore metrics:
   - **Traffic**: Views, clones, referrers
   - **Commits**: Activity over time
   - **Community**: Issues, PRs, discussions
   - **Network**: Forks and dependencies

### Enable GitHub Traffic Tracking

Already enabled by default. Check:
- Repository → Settings → Check "Traffic" is visible

### Track Key Metrics

Monitor weekly:
- ⭐ Stars (growth rate)
- 👁️ Views (unique visitors)
- 🔄 Clones (download count)
- 🍴 Forks (developer interest)
- 🐛 Issues opened/closed
- 🎉 Pull requests

### Set Up GitHub Actions for Metrics

Create `.github/workflows/metrics.yml`:

```yaml
name: Collect Metrics

on:
  schedule:
    - cron: '0 0 * * 0' # Weekly on Sunday
  workflow_dispatch:

jobs:
  metrics:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Get repository stats
        run: |
          echo "Stars: $(gh repo view --json stargazerCount -q .stargazerCount)"
          echo "Forks: $(gh repo view --json forkCount -q .forkCount)"
          echo "Issues: $(gh repo view --json issues -q '.issues | length')"
        env:
          GH_TOKEN: ${{ github.token }}
```

---

## 4. AWS CloudWatch (Infrastructure Monitoring)

Monitor your AWS infrastructure.

### Step 1: Enable CloudWatch Metrics

Already enabled by Terraform. Verify in AWS Console:
- CloudWatch → Dashboards
- CloudWatch → Metrics

### Step 2: Create Custom Dashboard

1. Go to CloudWatch → Dashboards
2. Click "Create dashboard"
3. Name: "23Blocks Deploy"
4. Add widgets:

**S3 Metrics**:
- Bucket size (bytes)
- Number of objects
- All requests
- 4xx/5xx errors

**CloudFront Metrics**:
- Requests
- Bytes downloaded
- 4xx/5xx error rate
- Cache hit rate

**RDS/Database** (if using RDS):
- CPU utilization
- Database connections
- Read/write IOPS

### Step 3: Set Up Alarms

Create alarms for critical metrics:

```bash
# High error rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "23blocks-high-error-rate" \
  --alarm-description "Alert when error rate exceeds 5%" \
  --metric-name "4xxErrorRate" \
  --namespace "AWS/CloudFront" \
  --statistic Average \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold

# High S3 costs
aws cloudwatch put-metric-alarm \
  --alarm-name "23blocks-high-s3-costs" \
  --alarm-description "Alert when S3 costs exceed $50/month" \
  --metric-name "EstimatedCharges" \
  --namespace "AWS/Billing" \
  --statistic Maximum \
  --period 86400 \
  --threshold 50 \
  --comparison-operator GreaterThanThreshold
```

---

## 5. Tracking Important Events

### Events to Track

#### User Events
```typescript
// Signup
posthog.capture('user_signed_up', {
  method: 'email' // or 'github'
})

// Login
posthog.capture('user_logged_in', {
  method: 'email'
})
```

#### Project Events
```typescript
// Create project
posthog.capture('project_created', {
  projectName: project.name,
  hasDescription: !!project.description
})

// Delete project
posthog.capture('project_deleted', {
  projectId: project.id,
  deploymentCount: project._count.deployments
})
```

#### Deployment Events
```typescript
// Deployment started
posthog.capture('deployment_started', {
  projectId: project.id,
  source: 'cli' // or 'web'
})

// Deployment completed
posthog.capture('deployment_completed', {
  projectId: project.id,
  fileCount: deployment.fileCount,
  totalSize: deployment.totalSize,
  duration: deploymentTime,
  source: 'cli'
})

// Deployment failed
posthog.capture('deployment_failed', {
  projectId: project.id,
  error: error.message,
  source: 'cli'
})
```

#### CLI Events
```typescript
// CLI login
posthog.capture('cli_login', {
  version: packageJson.version
})

// CLI deployment
posthog.capture('cli_deploy', {
  fileCount: files.length,
  totalSize: totalSize,
  directory: deployDir
})
```

---

## 6. Analytics Dashboard

Create a custom dashboard to track key metrics.

### Key Metrics to Monitor

#### Growth Metrics
- 📈 Website visitors (daily/weekly)
- ⭐ GitHub stars (growth rate)
- 👥 New signups (daily/weekly)
- 🚀 Active deployments (total/weekly)

#### Engagement Metrics
- 🔄 Deployments per user (average)
- 📅 Weekly active users (WAU)
- 🎯 Feature adoption rates
- ⏱️ Time to first deployment

#### Technical Metrics
- ✅ Deployment success rate
- ⏱️ Average deployment time
- 📦 Average file count per deployment
- 💾 Average deployment size
- ⚠️ Error rates

#### Business Metrics
- 💰 AWS costs (S3, CloudFront)
- 📊 Cost per deployment
- 🏢 Agency signups
- 🎯 Conversion rates

---

## 7. Privacy & GDPR Compliance

### Anonymization

Configure PostHog to respect privacy:

```typescript
posthog.init(key, {
  api_host: host,
  opt_out_capturing_by_default: false,
  capture_pageview: true,
  autocapture: false, // Disable automatic event capture
  disable_session_recording: false, // Optional: disable session recording
  respect_dnt: true, // Respect Do Not Track
  ip: false, // Don't capture IP addresses
})
```

### Cookie Consent

Add cookie consent banner (use cookieconsent.js):

```html
<script src="https://cdn.jsdelivr.net/npm/cookieconsent@3/build/cookieconsent.min.js"></script>
<script>
window.cookieconsent.initialise({
  "palette": {
    "popup": { "background": "#667eea" },
    "button": { "background": "#ffffff" }
  },
  "theme": "classic",
  "content": {
    "message": "We use cookies to analyze site usage and improve your experience.",
    "dismiss": "Got it!",
    "link": "Learn more",
    "href": "/privacy"
  }
});
</script>
```

### Privacy Policy

Create `docs/privacy.html` with:
- What data you collect
- How you use it
- Third-party services (GA, PostHog)
- User rights (GDPR)
- Contact information

---

## 8. Weekly Metrics Review

Create a weekly metrics email/report:

### Metrics to Review

**Week of [Date]**

📊 **Traffic**
- Website visitors: 5,234 (+12%)
- GitHub views: 1,456 (+8%)
- Docs page views: 3,890 (+15%)

⭐ **Growth**
- GitHub stars: 1,234 (+56 this week)
- New signups: 89 (+23%)
- Active deployments: 456 (+34%)

🚀 **Engagement**
- Total deployments: 234
- Average deployments/user: 2.6
- Deployment success rate: 98.5%

💰 **Costs**
- AWS total: $42.50 (+$2.30)
- S3: $8.20
- CloudFront: $15.30
- RDS: $19.00

🎯 **Top Pages**
1. Homepage: 2,340 views
2. Setup Guide: 1,890 views
3. Quick Start: 1,234 views

---

## 9. Testing Analytics

### Test GA4
```javascript
// Open browser console on your site
gtag('event', 'test_event', {
  'event_category': 'test',
  'event_label': 'testing'
})

// Check in GA4: Realtime → Events
```

### Test PostHog
```javascript
// Open browser console
posthog.capture('test_event', {
  property: 'test_value'
})

// Check in PostHog: Activity → Live Events
```

---

## 10. Analytics Checklist

Before launch:
- [ ] Google Analytics 4 installed on docs site
- [ ] GA4 installed in Next.js platform
- [ ] PostHog configured
- [ ] Custom events implemented
- [ ] GitHub Insights enabled
- [ ] CloudWatch dashboard created
- [ ] CloudWatch alarms configured
- [ ] Privacy policy created
- [ ] Cookie consent banner added
- [ ] Test all tracking (in incognito mode)

---

## Resources

- [GA4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [PostHog Documentation](https://posthog.com/docs)
- [Next.js Analytics](https://nextjs.org/docs/app/building-your-application/optimizing/analytics)
- [AWS CloudWatch](https://docs.aws.amazon.com/cloudwatch/)

---

Now you have comprehensive analytics to track growth, engagement, and technical performance! 📊
