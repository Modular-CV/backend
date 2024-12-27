import { PrismaClient } from '@prisma/client'
import rootRouter from './root'
import accountsRouter from './accounts'

const prisma = new PrismaClient({
  omit: {
    account: {
      password: true,
    },
  },
})

export { rootRouter, accountsRouter, prisma }
