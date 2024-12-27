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

    const validatorObject = z.object(
      {
        id: z.number(),
        expiresAt: z.date().refine((expiresAt) => {
          return new Date(expiresAt).getTime() >= new Date().getTime()
        }, 'Expired token'),
        isUsed: z.boolean().refine((isUsed) => isUsed === false, 'Used token'),
      },
      {
        message: 'Invalid Token',
      },
    )

    const validator = validatorObject.safeParse(verificationToken)

    if (!validator.success) {
      response.status(400)
      response.json(validator.error.format())
      return
    }

    await prisma.verificationToken.update({
      where: {
        id: validator.data.id,
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
  const isEmailRegistered = async () => {
    const count = await prisma.account.count({
      where: {
        email: data.email,
      },
    })

    return count === 0
  }

  const validatorObject = z.object({
    email: z
      .string()
      .email()
      .refine(async () => {
        return await isEmailRegistered()
      }, 'Email registered'),
    password: z.string().min(4),
  }) satisfies z.Schema<Prisma.AccountCreateInput>

  const validator = await validatorObject.safeParseAsync(data)

  if (!validator.success) {
    response.status(400)
    response.json(validator.error.format())
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

  const pepper = process.env.PEPPER_SECRET
  data.password = await argon2.hash(`${pepper}:${data.password}`)

  const account = await prisma.account.create({ data: data })

  await prisma.verificationToken.create({
    data: {
      token,
      accountId: account.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  })

  response.json(account)
})

export default accountsRouter
