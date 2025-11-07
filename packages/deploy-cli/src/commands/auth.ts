import chalk from 'chalk'
import prompts from 'prompts'
import fetch from 'node-fetch'
import { getConfig, setConfig, clearConfig, isLoggedIn } from '../config'

export async function login(options: { email?: string; password?: string }) {
  console.log(chalk.blue('🔐 Login to 23Blocks Deploy\n'))

  let { email, password } = options

  if (!email || !password) {
    const response = await prompts([
      {
        type: 'text',
        name: 'email',
        message: 'Email:',
        validate: value => (value.includes('@') ? true : 'Please enter a valid email'),
      },
      {
        type: 'password',
        name: 'password',
        message: 'Password:',
      },
    ])

    email = response.email
    password = response.password
  }

  if (!email || !password) {
    console.log(chalk.red('❌ Email and password are required'))
    process.exit(1)
  }

  try {
    const config = getConfig()
    const response = await fetch(`${config.apiUrl}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      console.log(chalk.red('❌ Invalid email or password'))
      process.exit(1)
    }

    const data: any = await response.json()

    // Store credentials
    setConfig('email', email)
    setConfig('token', data.token || 'authenticated')

    console.log(chalk.green('✅ Successfully logged in!'))
    console.log(chalk.gray(`   Logged in as: ${email}`))
  } catch (error) {
    console.log(chalk.red('❌ Login failed. Please try again.'))
    console.error(error)
    process.exit(1)
  }
}

export async function logout() {
  if (!isLoggedIn()) {
    console.log(chalk.yellow('⚠️  You are not logged in'))
    return
  }

  clearConfig()
  console.log(chalk.green('✅ Successfully logged out'))
}

export async function whoami() {
  if (!isLoggedIn()) {
    console.log(chalk.yellow('⚠️  You are not logged in'))
    console.log(chalk.gray('   Run: 23blocks-deploy login'))
    return
  }

  const config = getConfig()
  console.log(chalk.blue('👤 Current User\n'))
  console.log(chalk.gray(`   Email: ${config.email}`))
  console.log(chalk.gray(`   API URL: ${config.apiUrl}`))
}
