declare namespace Express {
  type JwtPayload = import('jsonwebtoken').JwtPayload
  export interface Request {
    user?: string | JwtPayload
  }
}

declare namespace NodeJS {
  export interface ProcessEnv {
    PORT: string
    PROJECT_NAME: string
    DOMAIN: string
    TOKEN_SECRET: string
    PEPPER_SECRET: string
    NODE_MAILER_SERVICE: string
    NODE_MAILER_USER: string
    NODE_MAILER_PASS: string
    NODE_MAILER_SENDER: string
  }
}
