import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import { MailOptions } from 'nodemailer/lib/sendmail-transport'
import argon2 from 'argon2'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

export const generateSecurePassword = async (password: string) => {
  const secret = Buffer.from(process.env.PEPPER_SECRET, 'utf-8')
  return await argon2.hash(password, { secret })
}

export const verifySecurePassword = async (
  digest: string,
  password: string,
) => {
  const secret = Buffer.from(process.env.PEPPER_SECRET, 'utf-8')
  return await argon2.verify(digest, password, { secret })
}

export const generateSessionToken = (userName: string) => {
  const tokenSecret = process.env.TOKEN_SECRET

  if (!tokenSecret) throw new Error('Token secret is not defined')

  return jwt.sign({ userName }, tokenSecret)
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
