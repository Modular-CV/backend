import { z } from 'zod'
import { prisma } from './index.ts'
import { EntryType, Prisma } from '@prisma/client'
import { ErrorCode } from '../types.ts'

export const getMySections: RequestHandler = ({ accessToken }, response) => {
  const sections = prisma.section.findMany({
    where: {
      accountId: accessToken?.account.id,
    },
  })

  response.json({
    status: 'SUCCESS',
    data: {
      sections,
    },
  })
}

export const postMySection: RequestHandler = async (
  { accessToken, body },
  response,
) => {
  const validatorObject = z.object({
    title: z.string(),
    entryType: z.nativeEnum(EntryType),
  }) satisfies z.Schema<Prisma.SectionUncheckedCreateWithoutAccountInput>

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

  const section = await prisma.section.create({
    data: {
      ...data,
      accountId: accessToken!.account.id,
    },
  })

  response.json({
    status: 'SUCCESS',
    data: {
      section,
    },
  })
}
