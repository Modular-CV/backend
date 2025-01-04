import { PrismaClient } from '@prisma/client'
import * as rootController from './root'
import * as accountController from './account'
import * as sessionController from './session'
import * as resumeController from './resume'
import * as profileController from './profile'
import * as linkController from './link'

export const prisma = new PrismaClient({
  omit: {
    account: {
      password: true,
    },
  },
})

export {
  rootController,
  accountController,
  sessionController,
  resumeController,
  profileController,
  linkController,
}
