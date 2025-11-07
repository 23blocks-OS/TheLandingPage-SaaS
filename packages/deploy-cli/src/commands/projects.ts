import chalk from 'chalk'
import prompts from 'prompts'
import fetch from 'node-fetch'
import { getConfig, isLoggedIn } from '../config'

export async function listProjects() {
  if (!isLoggedIn()) {
    console.log(chalk.red('❌ You must be logged in'))
    console.log(chalk.gray('   Run: 23blocks-deploy login'))
    process.exit(1)
  }

  try {
    const config = getConfig()
    const response = await fetch(`${config.apiUrl}/api/projects`, {
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch projects')
    }

    const data: any = await response.json()
    const projects = data.projects

    console.log(chalk.blue(`\n📦 Your Projects (${projects.length})\n`))

    if (projects.length === 0) {
      console.log(chalk.gray('   No projects yet. Create one with:'))
      console.log(chalk.gray('   23blocks-deploy create-project'))
      return
    }

    projects.forEach((project: any) => {
      console.log(chalk.bold(`   ${project.name}`))
      console.log(chalk.gray(`   ID: ${project.id}`))
      console.log(chalk.gray(`   Subdomain: ${project.subdomain}`))
      console.log(chalk.gray(`   Deployments: ${project._count.deployments}`))
      console.log()
    })
  } catch (error) {
    console.log(chalk.red('❌ Failed to fetch projects'))
    console.error(error)
    process.exit(1)
  }
}

export async function createProject(options: { name?: string; description?: string }) {
  if (!isLoggedIn()) {
    console.log(chalk.red('❌ You must be logged in'))
    console.log(chalk.gray('   Run: 23blocks-deploy login'))
    process.exit(1)
  }

  let { name, description } = options

  if (!name) {
    const response = await prompts([
      {
        type: 'text',
        name: 'name',
        message: 'Project name:',
        validate: value => (value.length > 0 ? true : 'Project name is required'),
      },
      {
        type: 'text',
        name: 'description',
        message: 'Description (optional):',
      },
    ])

    name = response.name
    description = response.description
  }

  try {
    const config = getConfig()
    const response = await fetch(`${config.apiUrl}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.token}`,
      },
      body: JSON.stringify({ name, description }),
    })

    if (!response.ok) {
      throw new Error('Failed to create project')
    }

    const data: any = await response.json()
    const project = data.project

    console.log(chalk.green('\n✅ Project created successfully!\n'))
    console.log(chalk.bold(`   ${project.name}`))
    console.log(chalk.gray(`   ID: ${project.id}`))
    console.log(chalk.gray(`   Subdomain: ${project.subdomain}`))
    console.log(chalk.gray(`\n   Deploy with: 23blocks-deploy deploy -p ${project.id}`))
  } catch (error) {
    console.log(chalk.red('❌ Failed to create project'))
    console.error(error)
    process.exit(1)
  }
}

export async function deleteProject(projectId: string) {
  if (!isLoggedIn()) {
    console.log(chalk.red('❌ You must be logged in'))
    console.log(chalk.gray('   Run: 23blocks-deploy login'))
    process.exit(1)
  }

  const { confirm } = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: 'Are you sure you want to delete this project?',
  })

  if (!confirm) {
    console.log(chalk.yellow('Cancelled'))
    return
  }

  try {
    const config = getConfig()
    const response = await fetch(`${config.apiUrl}/api/projects/${projectId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to delete project')
    }

    console.log(chalk.green('✅ Project deleted successfully'))
  } catch (error) {
    console.log(chalk.red('❌ Failed to delete project'))
    console.error(error)
    process.exit(1)
  }
}
