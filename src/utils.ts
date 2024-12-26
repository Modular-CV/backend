import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import { MailOptions } from 'nodemailer/lib/sendmail-transport'

export const generateSessionToken = (userName: string) => {
  const tokenSecret = process.env.TOKEN_SECRET

  if (!tokenSecret) throw new Error('Token secret is not defined')

  return jwt.sign({ userName }, tokenSecret)
}

export const sendMail = (mailOptions: MailOptions) => {
  const mailerTransporter = nodemailer.createTransport({
    service: process.env.NODE_MAILER_SERVICE,
    auth: {
      user: process.env.NODE_MAILER_USER,
      pass: process.env.NODE_MAILER_PASS,
    },
  })

  mailerTransporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.warn(error.message)
      return
    }
    console.log('Email sent: ' + info.response)
  })
}
