import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from './index.ts'
import {
  generateSessionToken,
  hashString,
  verifyHashedString,
} from '../utils.ts'
import { ErrorCode, Route } from '../types.ts'
import jwt from 'jsonwebtoken'
import { type Response } from 'express'

/**
 * This function will mutate the response object
 */
const generateSessionTokens = async (
  response: Response,
  account: RequestAccount,
) => {
  const accessToken = generateSessionToken(account, 'access')
  const refreshToken = generateSessionToken(account, 'refresh')

  const hashedToken = await hashString(refreshToken)

  await prisma.refreshToken.upsert({
    create: {
      accountId: account.id,
      expiresAt: new Date(
        Date.now() + Number(process.env.REFRESH_TOKEN_MAX_AGE),
      ),
      tokenHash: hashedToken,
    },
    update: {
      expiresAt: new Date(
        Date.now() + Number(process.env.REFRESH_TOKEN_MAX_AGE),
      ),
      tokenHash: hashedToken,
    },
    where: {
      accountId: account.id,
    },
  })

  response.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: Number(process.env.ACCESS_TOKEN_MAX_AGE),
  })

  response.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: Number(process.env.REFRESH_TOKEN_MAX_AGE),
    path: Route.refreshMySession,
  })

  return {
    accessToken,
    refreshToken,
  }
}

export const refresh: RequestHandler = async (
  { cookies, headers },
  response,
) => {
  const authRefreshToken = headers.authorization?.split(' ')[1]

  const refreshToken: string | undefined =
    cookies['refreshToken'] || authRefreshToken

  if (!refreshToken) {
    response.status(400).json({
      status: 'ERROR',
      message: ErrorCode['AUTH-006'],
      error: 'AUTH-006',
    })
    return
  }

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (error, payload) => {
      if (error) {
        switch (error.message) {
          case 'invalid token': {
            response.status(401).json({
              status: 'ERROR',
              message: ErrorCode['AUTH-007'],
              error: 'AUTH-007',
            })
            return
          }
          case 'jwt expired': {
            response.status(401).json({
              status: 'ERROR',
              message: ErrorCode['AUTH-008'],
              error: 'AUTH-008',
            })
            return
          }
          default: {
            response.status(401).json({
              status: 'ERROR',
              data: {
                details: error.message,
              },
              message: ErrorCode['AUTH-007'],
              error: 'AUTH-007',
            })
            return
          }
        }
      }

      if (typeof payload === 'object') {
        const customPayload = payload as CustomJwtPayload

        const refreshTokenFound = await prisma.refreshToken.findUnique({
          where: {
            accountId: customPayload.account.id,
          },
        })

        if (!refreshTokenFound) {
          response.status(401).json({
            status: 'ERROR',
            message: ErrorCode['AUTH-007'],
            error: 'AUTH-007',
          })
          return
        }

        const isMatch = await verifyHashedString(
          refreshTokenFound.tokenHash,
          refreshToken,
        )

        if (!isMatch) {
          response.status(401).json({
            status: 'ERROR',
            message: ErrorCode['AUTH-007'],
            error: 'AUTH-007',
          })
          return
        }

        const account = customPayload.account

        const tokens = await generateSessionTokens(response, account)

        response.json({
          status: 'SUCCESS',
          data: tokens,
        })
      }
    },
  )
}

export const get: RequestHandler = async ({ jwtPayload }, response) => {
  response.json({
    status: 'SUCCESS',
    data: { jwtPayload },
  })
}

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
      message: ErrorCode['VAL-001'],
      error: 'VAL-001',
      data: {
        issues: validator.error.issues,
      },
    })
    return
  }

  const { email, password } = validator.data

  const accountSelect = Prisma.validator(
    prisma,
    'account',
    'findUnique',
    'select',
  )({
    id: true,
    email: true,
    password: true,
  })

  const accountFound = await prisma.account.findUnique({
    select: accountSelect,
    where: { email },
  })

  if (!accountFound) {
    response.status(401)
    response.json({
      status: 'ERROR',
      message: ErrorCode['AUTH-003'],
      error: 'AUTH-003',
    })
    return
  }

  const { password: digest, ...account } = accountFound

  const isMatch = await verifyHashedString(digest, password)

  if (!isMatch) {
    response.status(401)
    response.json({
      status: 'ERROR',
      message: ErrorCode['AUTH-003'],
      error: 'AUTH-003',
    })
    return
  }

  const tokens = await generateSessionTokens(response, account)

  response.json({
    status: 'SUCCESS',
    data: tokens,
  })
}
