import jwt from 'jsonwebtoken'
import { ErrorCodes } from './types'

export const authenticateSessionToken: RequestHandler = (
  request,
  response,
  next,
) => {
  if (!process.env.ACCESS_TOKEN_SECRET)
    throw new Error('token secret is not defined')

  const cookies = request.cookies
  const accessToken: string = cookies['accessToken']

  if (!accessToken) {
    response.status(400).json({
      status: 'ERROR',
      message: ErrorCodes['AUTH-001'],
      error: 'AUTH-001',
    })
    return
  }

  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (error, payload) => {
    if (error) {
      switch (error.message) {
        case 'invalid token': {
          response.status(401).json({
            status: 'ERROR',
            message: ErrorCodes['AUTH-002'],
            error: 'AUTH-002',
          })
          return
        }
        case 'jwt expired': {
          response.status(401).json({
            status: 'ERROR',
            message: ErrorCodes['AUTH-005'],
            error: 'AUTH-005',
          })
          return
        }
        default: {
          response.status(401).json({
            status: 'ERROR',
            data: {
              details: error.message,
            },
            message: ErrorCodes['AUTH-002'],
            error: 'AUTH-002',
          })
          return
        }
      }
    }

    if (typeof payload === 'object') request.accessToken = payload

    next()
  })
}
