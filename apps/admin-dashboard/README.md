# 23Blocks Admin Dashboard

Admin dashboard for managing the 23Blocks deployment platform. View all deployments, manage users, trigger system jobs, and monitor platform health.

## Features

### Dashboard
- Platform statistics (users, deployments, storage, health)
- Recent activity feed
- Quick action buttons

### User Management
- View all users with project and deployment counts
- Search and filter users
- Delete users and their associated data
- Email users directly

### Deployment Management
- View all deployments across all users
- Search by project name, user email, or subdomain
- Filter by deployment status
- Actions: View, Rebuild, Delete
- Real-time status tracking

### Job Management
- Trigger background jobs manually:
  - Cleanup old deployments
  - Invalidate CloudFront cache
  - Send notifications
  - Generate reports
  - Sync metrics
  - Backup database
- View job queue with real-time status
- Cancel pending jobs
- Auto-refresh every 5 seconds

### System Monitoring
- AWS metrics (S3 storage, CloudFront requests, bandwidth)
- Database metrics (size, connections, table count)
- Platform metrics (uptime, requests, error rate)
- Health checks for all services
- System actions (clear cache, optimize database)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **AWS SDK**: S3 and CloudFront management

## Prerequisites

- Node.js 18+
- pnpm 9+
- PostgreSQL database
- AWS credentials with S3 and CloudFront access

## Installation

From the repository root:

```bash
# Install dependencies
pnpm install

# Navigate to admin dashboard
cd apps/admin-dashboard

# Set up environment variables
cp .env.example .env
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/23blocks?schema=public"

# AWS
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="your-bucket-name"
CLOUDFRONT_DISTRIBUTION_ID="your-distribution-id"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

## Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Create first admin user (you'll need to hash the password)
npx ts-node scripts/create-admin.ts
```

### Creating an Admin User

Create a script at `scripts/create-admin.ts`:

```typescript
import { db } from '../src/lib/db'
import { hash } from 'bcryptjs'

async function main() {
  const password = await hash('your-password', 10)

  const admin = await db.admin.create({
    data: {
      email: 'admin@example.com',
      password,
      name: 'Admin User',
      role: 'SUPER_ADMIN',
    },
  })

  console.log('Admin created:', admin.email)
}

main()
```

Run it:
```bash
npx tsx scripts/create-admin.ts
```

## Development

```bash
# Start development server (from repo root)
pnpm dev:admin

# Or from admin-dashboard directory
pnpm dev
```

The admin dashboard will be available at http://localhost:3001

## Production Build

```bash
# Build the app
pnpm build

# Start production server
pnpm start
```

## Project Structure

```
apps/admin-dashboard/
├── src/
│   ├── app/
│   │   ├── (admin)/          # Protected admin routes
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx           # Dashboard
│   │   │   │   ├── users/             # User management
│   │   │   │   ├── deployments/       # Deployment management
│   │   │   │   ├── jobs/              # Job management
│   │   │   │   ├── system/            # System monitoring
│   │   │   │   └── settings/          # Settings
│   │   │   └── layout.tsx    # Admin layout with sidebar
│   │   ├── api/
│   │   │   └── admin/        # Admin API routes
│   │   ├── login/            # Login page
│   │   └── layout.tsx        # Root layout
│   ├── lib/
│   │   ├── auth.ts           # Authentication utilities
│   │   ├── db.ts             # Prisma client
│   │   ├── admin-middleware.ts  # Auth middleware
│   │   └── utils.ts          # Utility functions
│   └── components/           # Reusable components
├── prisma/
│   └── schema.prisma         # Database schema
├── public/                   # Static assets
└── package.json
```

## API Routes

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout

### Stats
- `GET /api/admin/stats` - Platform statistics

### Deployments
- `GET /api/admin/deployments` - List all deployments
- `DELETE /api/admin/deployments/[id]` - Delete deployment
- `POST /api/admin/deployments/[id]/rebuild` - Rebuild deployment

### Users
- `GET /api/admin/users` - List all users
- `DELETE /api/admin/users/[id]` - Delete user

### Jobs
- `GET /api/admin/jobs` - List job queue
- `POST /api/admin/jobs` - Create new job
- `DELETE /api/admin/jobs/[id]` - Cancel job

### System
- `GET /api/admin/system/metrics` - System metrics
- `POST /api/admin/system/clear-cache` - Clear CloudFront cache
- `POST /api/admin/system/optimize-db` - Optimize database

## Security

### Authentication
- Admin sessions use HTTP-only cookies
- Passwords are hashed with bcrypt
- Sessions expire after 24 hours

### Authorization
- All admin routes protected by authentication middleware
- Role-based access control (SUPER_ADMIN, ADMIN, SUPPORT, VIEWER)

### Audit Logging
- All admin actions are logged to `admin_audit_logs` table
- Includes IP address, user agent, and action metadata
- Immutable audit trail

## Admin Roles

- **SUPER_ADMIN**: Full access to all features
- **ADMIN**: Standard admin access
- **SUPPORT**: Read access + limited actions
- **VIEWER**: Read-only access

## Troubleshooting

### Database Connection Issues
```bash
# Test database connection
npx prisma db pull
```

### AWS Credentials
Ensure your AWS credentials have the following permissions:
- S3: ListBucket, GetObject, PutObject, DeleteObject
- CloudFront: CreateInvalidation, GetDistribution

### Port Already in Use
Change the port in `package.json`:
```json
{
  "scripts": {
    "dev": "next dev -p 3002"
  }
}
```

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Submit a pull request

## License

Same as the main 23Blocks platform (see root LICENSE file)
