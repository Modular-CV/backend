import { PrismaClient } from '@prisma/client'
import * as root from './root'
import * as account from './account'
import * as session from './session'
import * as resume from './resume'
import * as profile from './profile'
import * as link from './link'
import * as section from './section'

const prisma = new PrismaClient({
  omit: {
    account: {
      password: true,
    },
  },
})

export { prisma, root, account, session, resume, profile, link, section }
