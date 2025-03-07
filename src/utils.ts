import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import argon2 from 'argon2'
import type { MailOptions } from 'nodemailer/lib/sendmail-transport/index.js'
import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js'

export const pascalToCamel = (key: string): string => {
  return key.replace(/^([A-Z])/, (match) => match.toLowerCase())
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const normalizeOutput = (object: Record<string, any>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const output: Record<string, any> = {}

  for (const key in object) {
    const currentValue = object[key]
    const camelCasedKey = pascalToCamel(key)
    output[camelCasedKey] =
      currentValue &&
      typeof currentValue === 'object' &&
      !Array.isArray(currentValue) &&
      !(currentValue instanceof Date)
        ? normalizeOutput(currentValue)
        : object[key]
  }

  return output
}

export const routeParser: RouteParser = (route, id, replace) => {
  return route.replace(id, replace) as ParsedRoute
}

export const hashString = async (string: string) => {
  const secret = Buffer.from(process.env.PEPPER_SECRET, 'utf-8')
  return await argon2.hash(string, { secret })
}

export const verifyHashedString = async (digest: string, string: string) => {
  const secret = Buffer.from(process.env.PEPPER_SECRET, 'utf-8')
  return await argon2.verify(digest, string, { secret })
}

export const generateSessionToken = (
  { id, email }: RequestAccount,
  type: 'access' | 'refresh',
) => {
  const account = { id, email }

  switch (type) {
    case 'access': {
      const tokenSecret = process.env.ACCESS_TOKEN_SECRET
      const expiresIn = Number(process.env.ACCESS_TOKEN_MAX_AGE) / 1000

      if (!tokenSecret) throw new Error('ACCESS_TOKEN_SECRET is not defined')

      return jwt.sign({ account }, tokenSecret, { expiresIn })
    }
    case 'refresh': {
      const tokenSecret = process.env.REFRESH_TOKEN_SECRET
      const expiresIn = Number(process.env.REFRESH_TOKEN_MAX_AGE) / 1000

      if (!tokenSecret) throw new Error('REFRESH_TOKEN_SECRET is not defined')

      return jwt.sign({ account }, tokenSecret, { expiresIn })
    }
  }
}

export const sendMail = async (mailOptions: MailOptions) => {
  let mailConfig: SMTPTransport.Options | null = null

  if (process.env.NODE_ENV === 'production') {
    mailConfig = {
      service: process.env.NODE_MAILER_SERVICE,
      auth: {
        user: process.env.NODE_MAILER_USER,
        pass: process.env.NODE_MAILER_PASS,
      },
    }
  } else {
    const { user, pass } = await nodemailer.createTestAccount()
    mailConfig = {
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user, pass },
    }
  }

  const mailerTransporter = nodemailer.createTransport(mailConfig)

  const response = await mailerTransporter.sendMail(mailOptions)

  if (process.env.NODE_ENV !== 'production')
    console.log(
      'Email Sent! Preview URL: ' + nodemailer.getTestMessageUrl(response),
    )

  return response
}
