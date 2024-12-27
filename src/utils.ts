import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import { MailOptions } from 'nodemailer/lib/sendmail-transport'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

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

  return await mailerTransporter.sendMail(mailOptions)
}
