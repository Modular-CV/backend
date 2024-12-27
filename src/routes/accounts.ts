import { z } from 'zod'
import argon2 from 'argon2'
import { prisma } from '.'
import { Prisma } from '@prisma/client'
import { sendMail } from '../utils'
import express from 'express'

const accountsRouter = express.Router()

accountsRouter.get('/accounts', async ({ query }, response) => {
  const verificationTokenQuery =
    typeof query.verificationToken === 'string'
      ? query.verificationToken
      : undefined

  if (verificationTokenQuery) {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token: verificationTokenQuery },
    })

    const isInvalidValidToken =
      !verificationToken ||
      new Date().getTime() >= new Date(verificationToken.expiresAt).getTime() ||
      verificationToken.isUsed

    if (isInvalidValidToken) {
      response.status(400)
      response.json({ message: 'Invalid, expired or used verification token' })
      return
    }

    await prisma.verificationToken.update({
      where: {
        id: verificationToken.id,
      },
      data: {
        isUsed: true,
        account: {
          update: {
            isVerified: true,
          },
        },
      },
    })
  }

  response.json({ message: 'Email validation successful' })
})

accountsRouter.post('/accounts', async ({ body: data }, response) => {
  const validatorObject = z.object({
    email: z.string().email(),
    password: z.string().min(4),
  }) satisfies z.Schema<Prisma.AccountCreateInput>

  const validator = await validatorObject.safeParseAsync(data)

  if (!validator.success) {
    response.status(400)
    response.json(validator.error.format())
    return
  }

  const count = await prisma.account.count({
    where: {
      email: data.email,
    },
  })

  if (count) {
    response.status(409)
    response.json({ message: 'Email is already registered' })
    return
  }

  const domain = process.env.DOMAIN
  const projectName = process.env.PROJECT_NAME
  const emailSender = process.env.NODE_MAILER_SENDER
  const token = crypto.randomUUID()

  const result = await sendMail({
    sender: emailSender,
    subject: `${projectName} - Please Verify Your Email Address`,
    to: data.email,
    html: `
    <div>
      <h1>${projectName}</h1>
      <p>Thank you for registering!</p>
      <p>To complete your registration, please verify your email by clicking <a href="${domain}/accounts?verificationToken=${token}">here</a>.</p>
    </div>
    `,
  })

  if (result.rejected.length) {
    console.log(result)
    response.status(500)
    response.json({
      message: 'Account creation failed: Email could not be sent',
    })
    return
  }

  const secret = Buffer.from(process.env.PEPPER_SECRET, 'utf-8')
  data.password = await argon2.hash(data.password, { secret })

  const account = await prisma.account.create({ data: data })

  await prisma.verificationToken.create({
    data: {
      token,
      accountId: account.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  })

  response.json({ account })
})

export default accountsRouter
