# 23Blocks Deploy CLI

Command-line tool for deploying static sites to the 23Blocks deployment platform.

## Installation

### Global Installation

```bash
npm install -g @23blocks/deploy-cli
# or
pnpm install -g @23blocks/deploy-cli
# or
yarn global add @23blocks/deploy-cli
```

### Local Installation (in your project)

```bash
npm install --save-dev @23blocks/deploy-cli
# or
pnpm add -D @23blocks/deploy-cli
```

## Usage

### Login

Before deploying, you need to login:

```bash
23blocks-deploy login
```

Or provide credentials directly:

```bash
23blocks-deploy login -e your@email.com -p yourpassword
```

### Check Login Status

```bash
23blocks-deploy whoami
```

### Create a Project

```bash
23blocks-deploy create-project
```

Or specify details:

```bash
23blocks-deploy create-project -n "my-site" -d "My awesome website"
```

### List Projects

```bash
23blocks-deploy projects
```

### Deploy Your Site

Deploy from the default `./dist` directory:

```bash
23blocks-deploy deploy
```

Deploy from a custom directory:

```bash
23blocks-deploy deploy -d ./build
```

Deploy to a specific project:

```bash
23blocks-deploy deploy -p project-id-here
```

### Delete a Project

```bash
23blocks-deploy delete-project <project-id>
```

### Logout

```bash
23blocks-deploy logout
```

## Configuration

The CLI stores configuration in:
- macOS: `~/Library/Preferences/23blocks-deploy-nodejs/`
- Linux: `~/.config/23blocks-deploy-nodejs/`
- Windows: `%APPDATA%/23blocks-deploy-nodejs/Config/`

### Environment Variables

You can configure the API URL using an environment variable:

```bash
export DEPLOY_API_URL=https://your-deployment-platform.com
```

## Integration with Build Tools

### package.json Scripts

Add deployment to your npm scripts:

```json
{
  "scripts": {
    "build": "your-build-command",
    "deploy": "23blocks-deploy deploy -d ./dist"
  }
}
```

Then deploy with:

```bash
npm run build && npm run deploy
```

### GitHub Actions

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Deploy
        run: |
          npx @23blocks/deploy-cli login -e ${{ secrets.DEPLOY_EMAIL }} -p ${{ secrets.DEPLOY_PASSWORD }}
          npx @23blocks/deploy-cli deploy -p ${{ secrets.PROJECT_ID }}
```

## Commands Reference

| Command | Description | Options |
|---------|-------------|---------|
| `login` | Login to your account | `-e, --email` `-p, --password` |
| `logout` | Logout from your account | - |
| `whoami` | Display current user | - |
| `projects` | List all projects | - |
| `create-project` | Create a new project | `-n, --name` `-d, --description` |
| `delete-project <id>` | Delete a project | - |
| `deploy` | Deploy your site | `-p, --project` `-d, --dir` |

## Examples

### Deploy a React App

```bash
cd my-react-app
npm run build
23blocks-deploy deploy -d ./build
```

### Deploy a Next.js Static Export

```bash
cd my-nextjs-app
npm run build
23blocks-deploy deploy -d ./out
```

### Deploy a Vue App

```bash
cd my-vue-app
npm run build
23blocks-deploy deploy -d ./dist
```

## Troubleshooting

### Authentication Errors

If you see authentication errors:

1. Make sure you're logged in: `23blocks-deploy whoami`
2. Try logging in again: `23blocks-deploy logout && 23blocks-deploy login`

### Upload Errors

If uploads fail:

1. Check your internet connection
2. Verify the directory exists and contains files
3. Make sure files aren't too large (max 100MB total)

### Configuration Issues

To reset configuration:

```bash
23blocks-deploy logout
```

Then login again.

## Support

- GitHub Issues: https://github.com/23blocks-OS/TheLandingPage-SaaS/issues
- Documentation: https://docs.23blocks.net

## License

MIT
