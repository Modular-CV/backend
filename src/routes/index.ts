import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient({
  omit: {
    account: {
      password: true,
    },
  },
})

import rootRouter from './root'
import accountsRouter from './accounts'

export { rootRouter, accountsRouter }
