import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '.'
import { generateSessionToken, hashString, verifyHashedString } from '../utils'
import { ErrorCodes } from '../types'
import jwt from 'jsonwebtoken'
import { Routes } from '../routes'

export const refresh: RequestHandler = async ({ cookies }, response) => {
  const refreshToken: string = cookies['refreshToken']

  if (!refreshToken) {
    response.status(400).json({
      status: 'ERROR',
      message: ErrorCodes['AUTH-006'],
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
              message: ErrorCodes['AUTH-007'],
              error: 'AUTH-007',
            })
            return
          }
          case 'jwt expired': {
            response.status(401).json({
              status: 'ERROR',
              message: ErrorCodes['AUTH-008'],
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
              message: ErrorCodes['AUTH-007'],
              error: 'AUTH-007',
            })
            return
          }
        }
      }

      if (typeof payload === 'object') {
        const customPayload = payload as CustomJwtPayload
        const account = customPayload.account

        const newAccessToken = generateSessionToken(account, 'access')
        const newRefreshToken = generateSessionToken(account, 'refresh')

        const tokenHash = await hashString(newRefreshToken)

        await prisma.refreshToken.upsert({
          create: {
            accountId: account.id,
            expiresAt: new Date(
              Date.now() + Number(process.env.REFRESH_TOKEN_MAX_AGE),
            ),
            tokenHash,
          },
          update: {
            expiresAt: new Date(
              Date.now() + Number(process.env.REFRESH_TOKEN_MAX_AGE),
            ),
            tokenHash,
          },
          where: {
            accountId: account.id,
          },
        })

        response.cookie('accessToken', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: Number(process.env.ACCESS_TOKEN_MAX_AGE),
        })

        response.cookie('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: Number(process.env.REFRESH_TOKEN_MAX_AGE),
          path: Routes.refreshMySession,
        })

        response.json({
          status: 'SUCCESS',
          data: {
            accessToken: newAccessToken,
          },
        })
      }
    },
  )
}

export const get: RequestHandler = async ({ accessToken }, response) => {
  response.json({
    status: 'SUCCESS',
    data: { accessToken },
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
      message: ErrorCodes['VAL-001'],
      error: 'VAL-001',
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
      message: ErrorCodes['AUTH-003'],
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
      message: ErrorCodes['AUTH-003'],
      error: 'AUTH-003',
    })
    return
  }

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
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: Number(process.env.ACCESS_TOKEN_MAX_AGE),
  })

  response.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: Number(process.env.REFRESH_TOKEN_MAX_AGE),
    path: Routes.refreshMySession,
  })

  response.json({
    status: 'SUCCESS',
    data: {
      account,
    },
  })
}
