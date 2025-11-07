# Contributing to 23Blocks Deployment Platform

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Code of Conduct

Be respectful, inclusive, and considerate. We want this to be a welcoming community.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/23blocks-OS/TheLandingPage-SaaS/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, Node version, etc.)

### Suggesting Features

1. Check if the feature has been suggested in [Issues](https://github.com/23blocks-OS/TheLandingPage-SaaS/issues)
2. Create a new issue with:
   - Clear title and description
   - Use case and benefits
   - Proposed implementation (optional)

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Write/update tests if applicable
5. Update documentation if needed
6. Commit with clear messages
7. Push to your fork
8. Open a pull request

#### PR Guidelines

- Keep PRs focused on a single feature/fix
- Write clear commit messages
- Update README/docs if needed
- Add tests for new features
- Ensure all tests pass
- Follow the existing code style

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm 9+
- PostgreSQL (or DynamoDB)
- AWS account

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/your-username/TheLandingPage-SaaS.git
cd TheLandingPage-SaaS

# Install dependencies
pnpm install

# Set up environment
cp apps/deployment-platform/.env.example apps/deployment-platform/.env.local
# Edit .env.local with your settings

# Run database migrations
cd apps/deployment-platform
pnpm prisma migrate dev

# Start development server
pnpm dev
```

## Code Style

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Avoid `any` types
- Add JSDoc comments for public APIs

### React/Next.js

- Use functional components with hooks
- Prefer server components when possible
- Use client components only when needed
- Follow Next.js 14 app router conventions

### Formatting

We use Prettier for formatting:

```bash
pnpm format
```

### Linting

We use ESLint:

```bash
pnpm lint
```

## Project Structure

```
TheLandingPage-SaaS/
├── apps/
│   └── deployment-platform/    # Next.js web app
│       ├── src/
│       │   ├── app/            # App router pages
│       │   ├── lib/            # Utilities and helpers
│       │   └── types/          # TypeScript types
│       └── prisma/             # Database schema
├── packages/
│   └── deploy-cli/             # CLI tool
│       └── src/
│           └── commands/       # CLI commands
├── infrastructure/
│   └── terraform/              # AWS infrastructure
└── docs/                       # Documentation
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test
pnpm test path/to/test

# Watch mode
pnpm test:watch
```

### Writing Tests

- Write tests for new features
- Update tests for bug fixes
- Aim for good coverage
- Test edge cases

## Database Changes

When modifying the database schema:

```bash
# Create migration
pnpm prisma migrate dev --name your_migration_name

# Generate Prisma client
pnpm prisma generate
```

## Documentation

Update documentation when:
- Adding new features
- Changing APIs
- Modifying configuration
- Updating dependencies

Documentation locations:
- `README.md` - Overview and quick start
- `docs/` - Detailed guides
- Code comments - Complex logic
- API routes - JSDoc comments

## Commit Messages

Follow conventional commits:

```
feat: add user profile page
fix: resolve S3 upload timeout
docs: update AWS setup guide
chore: upgrade dependencies
refactor: simplify deployment logic
test: add tests for project creation
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

## Release Process

Maintainers will:
1. Review and merge PRs
2. Update version numbers
3. Create release notes
4. Tag releases
5. Publish to npm

## Getting Help

- [GitHub Discussions](https://github.com/23blocks-OS/TheLandingPage-SaaS/discussions)
- [GitHub Issues](https://github.com/23blocks-OS/TheLandingPage-SaaS/issues)
- [Documentation](./docs/)

## Recognition

Contributors will be recognized in:
- README.md
- Release notes
- Project website (when available)

Thank you for contributing! 🎉
