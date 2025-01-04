import * as core from 'express-serve-static-core'
import { RequestHandler as ExpressRequestHandler } from 'express'
import { ZodIssue } from 'zod'
import { ErrorCode } from './types'
import { Account } from '@prisma/client'
import { JwtPayload } from 'jsonwebtoken'
import { Route } from './types'
import TestAgent from 'supertest/lib/agent'
import { Test } from 'supertest'

declare global {
  type ParsedRoute = string & { __brand: 'ParsedRoute' }

  type ExtractParams<T extends string> =
    T extends `/${string}/:${infer Param}/${infer Rest}`
      ? `:${Param}` | ExtractParams<`/${Rest}`>
      : T extends `/${string}/:${infer Param}`
        ? `:${Param}`
        : never

  type RouteParser = <T extends Route>(
    route: T,
    param: ExtractParams<T>,
    replace: string,
  ) => ParsedRoute

  type RequestAccount = Pick<Account, 'id' | 'email'>

  type CustomJwtPayload = { account: RequestAccount } & JwtPayload

  type SuperRequest = Omit<TestAgent, 'post' | 'get'> &
    Record<'post' | 'get', (route: Route | ParsedRoute) => Test>

  type ResponseBody<ErrorCode = keyof typeof ErrorCode | undefined> =
    ErrorCode extends undefined
      ? { status: 'SUCCESS'; data?: unknown; message?: string }
      : {
          status: 'ERROR'
          message?: (typeof ErrorCode)[ErrorCode]
          error: ErrorCode
          data?: { issues: ZodIssue[] } | { details: string }
        }

  type RequestHandler<
    P = core.ParamsDictionary,
    ResBody = ResponseBody<undefined | keyof typeof ErrorCode>,
    ReqBody = unknown,
    ReqQuery = core.Query,
    Locals extends Record<string, unknown> = Record<string, unknown>,
  > = ExpressRequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>

  namespace Express {
    interface Request {
      accessToken?: CustomJwtPayload
    }
  }

  namespace NodeJS {
    interface ProcessEnv {
      ADMINER_PORT: number | string
      DATABASE_NAME: string
      DATABASE_PORT: number | string
      DATABASE_URL: string
      DOMAIN: string
      NODE_ENV: 'development' | 'production' | 'test'
      NODE_MAILER_PASS: string
      NODE_MAILER_SENDER: string
      NODE_MAILER_SERVICE: string
      NODE_MAILER_USER: string
      PEPPER_SECRET: string
      PORT: number | string
      PROJECT_NAME: string
      ACCESS_TOKEN_SECRET: string
      ACCESS_TOKEN_MAX_AGE: number | string
      REFRESH_TOKEN_SECRET: string
      REFRESH_TOKEN_MAX_AGE: number | string
    }
  }
}
