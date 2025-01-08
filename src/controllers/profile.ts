import { z } from 'zod'
import { prisma } from '.'
import { Prisma } from '@prisma/client'
import { ErrorCode } from '../types'

export const getMyProfiles: RequestHandler = async (
  { accessToken },
  response,
) => {
  const profiles = await prisma.profile.findMany({
    where: {
      accountId: accessToken?.account.id,
    },
  })

  response.json({
    status: 'SUCCESS',
    data: {
      profiles,
    },
  })
}

export const postMyProfile: RequestHandler = async (
  { body, accessToken },
  response,
) => {
  const inputs = {
    fullName: z.string(),
    jobTitle: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    Resume: z.object({}).optional(),
  }

  const validatorObject = z.object(
    inputs,
  ) satisfies z.Schema<Prisma.ProfileUncheckedCreateWithoutAccountInput>

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

  const data = validator.data

  const profile = await prisma.profile.create({
    data: {
      ...data,
      accountId: accessToken!.account.id,
    },
  })

  response.json({
    status: 'SUCCESS',
    data: {
      profile,
    },
  })
}
