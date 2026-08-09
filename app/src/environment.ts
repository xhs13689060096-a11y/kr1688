export type RuntimeEnvironment = {
  cronSecret: string
  databaseURL: string
  isProduction: boolean
  payloadSecret: string
  previewSecret: string
  serverURL: string
}

const requiredVariables = [
  'DATABASE_URL',
  'PAYLOAD_SECRET',
  'NEXT_PUBLIC_SERVER_URL',
  'CRON_SECRET',
  'PREVIEW_SECRET',
] as const

const placeholderValues = new Set([
  'YOUR_SECRET_HERE',
  'YOUR_CRON_SECRET_HERE',
  'CHANGE_ME',
])

function requiredValue(input: NodeJS.ProcessEnv, name: (typeof requiredVariables)[number]): string {
  const value = input[name]?.trim()

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export function loadEnvironment(input: NodeJS.ProcessEnv): RuntimeEnvironment {
  const values = Object.fromEntries(
    requiredVariables.map((name) => [name, requiredValue(input, name)]),
  ) as Record<(typeof requiredVariables)[number], string>
  const isProduction = input.NODE_ENV === 'production'

  if (isProduction) {
    for (const name of requiredVariables) {
      if (placeholderValues.has(values[name])) {
        throw new Error(`Invalid production environment variable: ${name}`)
      }
    }

    if (values.NEXT_PUBLIC_SERVER_URL.startsWith('http://')) {
      throw new Error('Invalid production environment variable: NEXT_PUBLIC_SERVER_URL')
    }
  }

  return {
    databaseURL: values.DATABASE_URL,
    payloadSecret: values.PAYLOAD_SECRET,
    serverURL: values.NEXT_PUBLIC_SERVER_URL,
    cronSecret: values.CRON_SECRET,
    previewSecret: values.PREVIEW_SECRET,
    isProduction,
  }
}
