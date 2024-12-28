import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '.'
import { verifySecurePassword } from '../utils'
import { ErrorCodes } from '../types'

export const post: RequestHandler = async ({ body }, response) => {
  const validatorObject = z.object({
    email: z.string().email(),
    password: z.string(),
  })

  const validator = validatorObject.safeParse(body)

  if (!validator.success) {
    response.status(400)
    response.json({
      status: 'ERROR',
      message: ErrorCodes['VAL-001'],
      error: 'VAL-001',
    })
    return
  }

  const { email, password } = validator.data

  const accountSelect: Prisma.AccountSelect = {
    id: true,
    createdAt: true,
    updatedAt: true,
    isVerified: true,
    email: true,
    password: true,
  }

  const accountFound = await prisma.account.findUnique({
    select: accountSelect,
    where: {
      email: email,
    },
  })

  if (!accountFound) {
    response.status(401)
    response.json({
      status: 'ERROR',
      message: ErrorCodes['AUTH-004'],
      error: 'AUTH-004',
    })
    return
  }

  const { password: digest, ...account } = accountFound

  const isMatch = await verifySecurePassword(digest, password)

  if (!isMatch) {
    response.status(401)
    response.json({
      status: 'ERROR',
      message: ErrorCodes['AUTH-004'],
      error: 'AUTH-004',
    })
    return
  }

  response.json({
    status: 'SUCCESS',
    data: {
      account,
    },
  })
}
