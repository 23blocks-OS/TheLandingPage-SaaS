#!/usr/bin/env tsx

/**
 * Script to create an admin user for the 23Blocks Admin Dashboard
 *
 * Usage:
 *   npx tsx scripts/create-admin.ts
 *
 * Or with environment variables:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secret npx tsx scripts/create-admin.ts
 */

import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import * as readline from 'readline'

const db = new PrismaClient()

interface AdminInput {
  email: string
  password: string
  name?: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT' | 'VIEWER'
}

async function question(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

async function getAdminInput(): Promise<AdminInput> {
  // Check environment variables first
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    return {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      name: process.env.ADMIN_NAME,
      role: (process.env.ADMIN_ROLE as any) || 'ADMIN',
    }
  }

  // Interactive mode
  console.log('\n=== Create Admin User ===\n')

  const email = await question('Email: ')
  const password = await question('Password: ')
  const name = await question('Name (optional): ')
  const roleInput = await question('Role (SUPER_ADMIN/ADMIN/SUPPORT/VIEWER) [ADMIN]: ')

  const role = roleInput.trim() || 'ADMIN'

  if (!['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'VIEWER'].includes(role)) {
    throw new Error('Invalid role')
  }

  return {
    email: email.trim(),
    password: password.trim(),
    name: name.trim() || undefined,
    role: role as any,
  }
}

async function main() {
  try {
    const input = await getAdminInput()

    // Validate email
    if (!input.email || !input.email.includes('@')) {
      throw new Error('Invalid email address')
    }

    // Validate password
    if (!input.password || input.password.length < 8) {
      throw new Error('Password must be at least 8 characters long')
    }

    // Check if admin already exists
    const existing = await db.admin.findUnique({
      where: { email: input.email },
    })

    if (existing) {
      throw new Error(`Admin with email ${input.email} already exists`)
    }

    // Hash password
    const hashedPassword = await hash(input.password, 10)

    // Create admin
    const admin = await db.admin.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
        role: input.role,
        isActive: true,
      },
    })

    console.log('\n✅ Admin user created successfully!\n')
    console.log('Email:', admin.email)
    console.log('Name:', admin.name || '(not set)')
    console.log('Role:', admin.role)
    console.log('ID:', admin.id)
    console.log('\nYou can now login at http://localhost:3001/login\n')
  } catch (error) {
    console.error('\n❌ Error creating admin:', error instanceof Error ? error.message : error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

main()
