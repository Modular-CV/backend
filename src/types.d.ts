declare namespace Express {
  type JwtPayload = import('jsonwebtoken').JwtPayload
  export interface Request {
    user?: string | JwtPayload
  }
}

declare namespace NodeJS {
  export interface ProcessEnv {
    DOMAIN: string
    NODE_ENV: 'development' | 'production'
    NODE_MAILER_SERVICE: string
    NODE_MAILER_USER: string
    NODE_MAILER_PASS: string
    NODE_MAILER_SENDER: string
    PEPPER_SECRET: string
    PORT: string
    PROJECT_NAME: string
    TOKEN_SECRET: string
    DATABASE_URL: string
  }
}
