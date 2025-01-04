import { PrismaClient } from '@prisma/client'
import * as root from './root'
import * as account from './account'
import * as session from './session'
import * as resume from './resume'
import * as profile from './profile'
import * as link from './link'
import * as section from './section'

export const prisma = new PrismaClient({
  omit: {
    account: {
      password: true,
    },
  },
})

export { root, account, session, resume, profile, link, section }
