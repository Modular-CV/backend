import { faker } from '@faker-js/faker/.'
import { Prisma } from '@prisma/client'
import { prisma } from '../src/controllers'
import { hashString } from '../src/utils'

export const generateAccountInput = () => {
  const account = Prisma.validator(
    prisma,
    'account',
    'create',
    'data',
  )({
    email: faker.internet.email(),
    password: faker.internet.password(),
  })

  return account
}

export const createAccount = async (account: Prisma.AccountCreateInput) => {
  return await prisma.account.create({
    data: {
      email: account.email,
      password: await hashString(account.password),
    },
  })
}
