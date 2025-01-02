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

export const generateResumeInput = () => {
  const resume = Prisma.validator(
    prisma,
    'resume',
    'create',
    'data',
  )({
    title: faker.book.title(),
  })

  return resume
}

export const createAccount = async (account: Prisma.AccountCreateInput) => {
  return await prisma.account.create({
    data: {
      email: account.email,
      password: await hashString(account.password),
    },
  })
}

/**
 * Used across multiple requests, typically to generate unique JWTs.
 */
export const sleep = (timeout: number) =>
  new Promise((resolve) => setTimeout(resolve, timeout))
