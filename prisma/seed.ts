import type { Prisma } from '@prisma/client'
import { prisma } from '../src/controllers/index.ts'
import { hashString } from '../src/utils.ts'

const main = async () => {
  const account: Prisma.AccountUncheckedCreateInput = {
    email: 'admin@test.com',
    password: 'admin',
  }

  await prisma.account.upsert({
    where: {
      email: 'admin@test.com',
    },
    update: {},
    create: {
      email: account.email,
      password: await hashString(account.password),
    },
  })

  console.log(`\n🧨 Test account: ${account.email} / ${account.password} 🧨\n`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
