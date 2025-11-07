#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import { login, logout, whoami } from './commands/auth'
import { deploy } from './commands/deploy'
import { listProjects, createProject, deleteProject } from './commands/projects'

const program = new Command()

program
  .name('23blocks-deploy')
  .description('CLI tool for deploying sites to 23Blocks deployment platform')
  .version('1.0.0')

// Auth commands
program
  .command('login')
  .description('Login to your 23Blocks account')
  .option('-e, --email <email>', 'Your email address')
  .option('-p, --password <password>', 'Your password')
  .action(login)

program
  .command('logout')
  .description('Logout from your account')
  .action(logout)

program
  .command('whoami')
  .description('Display current user information')
  .action(whoami)

// Project commands
program
  .command('projects')
  .description('List all your projects')
  .action(listProjects)

program
  .command('create-project')
  .description('Create a new project')
  .option('-n, --name <name>', 'Project name')
  .option('-d, --description <description>', 'Project description')
  .action(createProject)

program
  .command('delete-project <projectId>')
  .description('Delete a project')
  .action(deleteProject)

// Deploy command
program
  .command('deploy')
  .description('Deploy your site')
  .option('-p, --project <projectId>', 'Project ID')
  .option('-d, --dir <directory>', 'Directory to deploy (default: ./dist)')
  .action(deploy)

program.parse(process.argv)

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp()
}
