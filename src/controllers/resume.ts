import { z } from 'zod'
import { prisma } from '.'
import { Prisma } from '@prisma/client'
import { ErrorCodes } from '../types'

export const get: RequestHandler = async ({ accessToken }, response) => {
  const resumes = await prisma.resume.findMany({
    where: {
      accountId: accessToken?.account.id,
    },
  })

  response.json({
    status: 'SUCCESS',
    data: {
      resumes,
    },
  })
}

export const post: RequestHandler = async ({ accessToken, body }, response) => {
  const validatorObject = z.object({
    title: z.string(),
  }) satisfies z.Schema<Prisma.ResumeCreateWithoutAccountInput>

  const validator = validatorObject.safeParse(body)

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

  const resume = await prisma.resume.create({
    data: {
      ...data,
      accountId: accessToken!.account.id,
    },
  })

  response.json({
    status: 'SUCCESS',
    data: {
      resume,
    },
  })
}
