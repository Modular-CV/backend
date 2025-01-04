import { z } from 'zod'
import { prisma } from '.'
import { Prisma } from '@prisma/client'
import { ErrorCode } from '../types'

export const get: RequestHandler = async ({ accessToken }, response) => {
  const links = await prisma.link.findMany({
    where: {
      accountId: accessToken?.account.id,
    },
  })

  response.json({
    status: 'SUCCESS',
    data: {
      links,
    },
  })
}

export const post: RequestHandler = async ({ body, accessToken }, response) => {
  const validatorObject = z.object({
    url: z.string(),
  }) satisfies z.Schema<Prisma.LinkCreateWithoutAccountInput>

  const validator = validatorObject.safeParse(body)

  if (!validator.success) {
    response.status(400).json({
      status: 'ERROR',
      message: ErrorCode['VAL-001'],
      error: 'VAL-001',
      data: {
        issues: validator.error.issues,
      },
    })
    return
  }

  const { data } = validator

  const link = await prisma.link.create({
    data: {
      ...data,
      accountId: accessToken!.account.id,
    },
  })

  response.json({
    status: 'SUCCESS',
    data: {
      link,
    },
  })
}
