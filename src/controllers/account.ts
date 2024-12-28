import { Prisma } from '@prisma/client'
import { prisma } from '.'
import { generateSecurePassword, sendMail } from '../utils'
import { z } from 'zod'
import { ErrorCodes } from '../types'

export const get: RequestHandler = async ({ query }, response) => {
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
      response.json({
        status: 'ERROR',
        message: ErrorCodes['VER-001'],
        error: 'VER-001',
      })
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

    response.json({
      status: 'SUCCESS',
      message: 'Email validation successful',
    })
    return
  }

  response.json()
}

export const post: RequestHandler = async ({ body }, response) => {
  const validatorObject = z.object({
    email: z.string().email(),
    password: z.string().min(4),
  }) satisfies z.Schema<Prisma.AccountCreateInput>

  const validator = await validatorObject.safeParseAsync(body)

  if (!validator.success) {
    response.status(400)
    response.json({
      status: 'ERROR',
      message: ErrorCodes['VAL-001'],
      error: 'VAL-001',
      data: {
        issues: validator.error.issues,
      },
    })
    return
  }

  const { data } = validator

  const count = await prisma.account.count({
    where: {
      email: data.email,
    },
  })

  if (count) {
    response.status(409)
    response.json({
      status: 'ERROR',
      message: ErrorCodes['ACC-001'],
      error: 'ACC-001',
    })
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
      status: 'ERROR',
      message: ErrorCodes['ACC-002'],
      error: 'ACC-002',
    })
    return
  }

  data.password = await generateSecurePassword(data.password)

  const account = await prisma.account.create({ data: data })

  await prisma.verificationToken.create({
    data: {
      token,
      accountId: account.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  })

  response.json({
    status: 'SUCCESS',
    data: {
      account,
    },
  })
}
