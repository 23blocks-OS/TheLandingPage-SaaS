import Conf from 'conf'

export interface Config {
  apiUrl: string
  email?: string
  token?: string
}

const config = new Conf<Config>({
  projectName: '23blocks-deploy',
  defaults: {
    apiUrl: process.env.DEPLOY_API_URL || 'http://localhost:3000',
  },
})

export function getConfig(): Config {
  return {
    apiUrl: config.get('apiUrl'),
    email: config.get('email'),
    token: config.get('token'),
  }
}

export function setConfig(key: keyof Config, value: string): void {
  config.set(key, value)
}

export function clearConfig(): void {
  config.clear()
}

export function isLoggedIn(): boolean {
  return !!config.get('token')
}
