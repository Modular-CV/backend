import jwt from 'jsonwebtoken'
import { ErrorCodes } from './types'

export const authenticateSessionToken: RequestHandler = (
  request,
  response,
  next,
) => {
  if (!process.env.TOKEN_SECRET) throw new Error('token secret is not defined')

  const authHeader = request.headers.authorization

  if (!authHeader) {
    response.status(400).json({
      status: 'ERROR',
      error: 'AUTH-001',
      message: ErrorCodes['AUTH-001'],
    })
    return
  }

  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    response.status(400).json({
      status: 'ERROR',
      error: 'AUTH-002',
      message: ErrorCodes['AUTH-002'],
    })
    return
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (error, user) => {
    if (error) {
      switch (error.message) {
        case 'invalid token': {
          response.status(403).json({
            status: 'ERROR',
            error: 'AUTH-003',
            message: ErrorCodes['AUTH-003'],
          })
          break
        }
        default: {
          response.status(403).json({
            status: 'ERROR',
            error: 'AUTH-003',
            message: ErrorCodes['AUTH-003'],
          })
          break
        }
      }
      return
    }

    request.user = user

    next()
  })
}
