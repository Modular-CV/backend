import { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'

export const authenticateSessionToken: RequestHandler = (
  request,
  response,
  next,
) => {
  if (!process.env.TOKEN_SECRET) throw new Error('token secret is not defined')

  const authHeader = request.headers.authorization

  if (!authHeader) {
    response.status(400).json({ message: 'authorization header is required' })
    return
  }

  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    response.status(400).json({ message: 'token is required' })
    return
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (error, user) => {
    if (error) {
      console.warn(error.message)
      if (error.message === 'invalid token')
        response.status(403).json({ message: 'invalid token' })
      return
    }

    request.user = user

    next()
  })
}
