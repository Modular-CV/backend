import * as core from 'express-serve-static-core'
import { RequestHandler as ExpressRequestHandler } from 'express'
import JwtPayload from 'jsonwebtoken'
import { ZodIssue } from 'zod'
import { ErrorCodes } from './types'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | string
    }
  }

  namespace NodeJS {
    interface ProcessEnv {
      ADMINER_PORT: string | number
      DATABASE_NAME: string
      DATABASE_PORT: string | number
      DATABASE_URL: string
      DOMAIN: string
      NODE_ENV: 'development' | 'production'
      NODE_MAILER_PASS: string
      NODE_MAILER_SENDER: string
      NODE_MAILER_SERVICE: string
      NODE_MAILER_USER: string
      PEPPER_SECRET: string
      PORT: string | number
      PROJECT_NAME: string
      TOKEN_SECRET: string
    }
  }

  type RequestBody<ErrorCode extends keyof typeof ErrorCodes | undefined> =
    ErrorCode extends undefined
      ? { status: 'SUCCESS'; data?: unknown; message?: string }
      : {
          status: 'ERROR'
          data?: { issues: ZodIssue[] }
          error: ErrorCode
          message?: (typeof ErrorCodes)[ErrorCode]
        }

  type RequestHandler<
    P = core.ParamsDictionary,
    ResBody = RequestBody<undefined | keyof typeof ErrorCodes>,
    ReqBody = unknown,
    ReqQuery = core.Query,
    Locals extends Record<string, unknown> = Record<string, unknown>,
  > = ExpressRequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>
}
