import chalk from 'chalk'
import prompts from 'prompts'
import ora from 'ora'
import fetch from 'node-fetch'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'
import { glob } from 'glob'
import { getConfig, isLoggedIn } from '../config'

export async function deploy(options: { project?: string; dir?: string }) {
  if (!isLoggedIn()) {
    console.log(chalk.red('❌ You must be logged in'))
    console.log(chalk.gray('   Run: 23blocks-deploy login'))
    process.exit(1)
  }

  let { project: projectId, dir } = options

  // Default to ./dist directory
  if (!dir) {
    dir = './dist'
  }

  // Check if directory exists
  if (!fs.existsSync(dir)) {
    console.log(chalk.red(`❌ Directory not found: ${dir}`))
    console.log(chalk.gray('   Specify a directory with: -d <directory>'))
    process.exit(1)
  }

  // Get project ID if not provided
  if (!projectId) {
    const config = getConfig()
    const response = await fetch(`${config.apiUrl}/api/projects`, {
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
    })

    const data: any = await response.json()
    const projects = data.projects

    if (projects.length === 0) {
      console.log(chalk.red('❌ No projects found'))
      console.log(chalk.gray('   Create one with: 23blocks-deploy create-project'))
      process.exit(1)
    }

    const { selectedProject } = await prompts({
      type: 'select',
      name: 'selectedProject',
      message: 'Select a project:',
      choices: projects.map((p: any) => ({
        title: `${p.name} (${p.subdomain})`,
        value: p.id,
      })),
    })

    projectId = selectedProject
  }

  if (!projectId) {
    console.log(chalk.yellow('Cancelled'))
    process.exit(0)
  }

  console.log(chalk.blue('\n🚀 Deploying to 23Blocks\n'))
  console.log(chalk.gray(`   Project: ${projectId}`))
  console.log(chalk.gray(`   Directory: ${dir}\n`))

  const spinner = ora('Preparing files...').start()

  try {
    // Find all files in directory
    const files = await glob('**/*', {
      cwd: dir,
      nodir: true,
      dot: true,
    })

    spinner.text = `Found ${files.length} files`

    // Create form data
    const formData = new FormData()
    formData.append('projectId', projectId)

    // Add each file
    for (const file of files) {
      const filePath = path.join(dir, file)
      const stream = fs.createReadStream(filePath)
      formData.append('files', stream, file)
    }

    spinner.text = 'Uploading files...'

    // Upload to API
    const config = getConfig()
    const response = await fetch(`${config.apiUrl}/api/deploy`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
        ...formData.getHeaders(),
      },
      body: formData,
    })

    if (!response.ok) {
      const error: any = await response.json()
      throw new Error(error.error || 'Deployment failed')
    }

    const data: any = await response.json()

    spinner.succeed('Deployment complete!')

    console.log(chalk.green('\n✅ Your site is live!\n'))
    console.log(chalk.bold(`   ${data.deployment.url}`))
    console.log(chalk.gray(`\n   Deployment ID: ${data.deployment.id}`))
  } catch (error) {
    spinner.fail('Deployment failed')
    console.log(chalk.red(`\n❌ ${error instanceof Error ? error.message : 'Unknown error'}`))
    process.exit(1)
  }
}
