import { z } from 'zod'
import { prisma } from './index.ts'
import { Prisma } from '@prisma/client'
import { ErrorCode } from '../types.ts'

export const getMyResumes: RequestHandler = async (
  { jwtPayload },
  response,
) => {
  const resumes = await prisma.resume.findMany({
    where: {
      accountId: jwtPayload?.account.id,
    },
  })

  response.json({
    status: 'SUCCESS',
    data: {
      resumes,
    },
  })
}

export const postMyResume: RequestHandler = async (
  { jwtPayload, body },
  response,
) => {
  const validatorObject = z.object({
    title: z.string().trim().min(1),
  }) satisfies z.Schema<Prisma.ResumeUncheckedCreateWithoutAccountInput>

  const validator = validatorObject.safeParse(body)

  if (!validator.success) {
    response.status(400)
    response.json({
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

  const resume = await prisma.resume.create({
    data: {
      ...data,
      accountId: jwtPayload!.account.id,
    },
  })

  response.json({
    status: 'SUCCESS',
    data: {
      resume,
    },
  })
}

export const getById: RequestHandler = async ({ params }, response) => {
  const resumeId = params.resumeId

  const resume = await prisma.resume.findUnique({
    where: {
      id: resumeId,
    },
  })

  if (!resume) {
    response.status(404).json({
      status: 'ERROR',
      message: ErrorCode['VAL-002'],
      error: 'VAL-002',
      data: {
        details: `Resource id: ${resumeId}`,
      },
    })
    return
  }

  response.json({
    status: 'SUCCESS',
    data: {
      resume,
    },
  })
}
