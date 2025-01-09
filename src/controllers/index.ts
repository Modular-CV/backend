import { PrismaClient } from '@prisma/client'
import * as root from './root.ts'
import * as account from './account.ts'
import * as session from './session.ts'
import * as resume from './resume.ts'
import * as profile from './profile.ts'
import * as link from './link.ts'
import * as section from './section.ts'
import * as entry from './entry.ts'

const prisma = new PrismaClient({
  omit: {
    account: {
      password: true,
    },
  },
})

export { prisma, root, account, session, resume, profile, link, section, entry }
