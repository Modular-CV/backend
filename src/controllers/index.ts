import { PrismaClient } from '@prisma/client'
import * as rootController from './root'
import * as accountController from './account'
import * as sessionController from './session'
import * as resumeController from './resume'

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
}
