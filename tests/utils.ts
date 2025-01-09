import { faker } from '@faker-js/faker'
import { EntryType, Prisma } from '@prisma/client'
import { prisma } from '../src/controllers/index.ts'
import { hashString } from '../src/utils.ts'

export const generateEntryDateInput = () => {
  return Prisma.validator<EntryDateUncheckedCreateInput>()({
    entryStartDate: {
      date: faker.date.past(),
      isVisible: faker.datatype.boolean(),
      isOnlyYear: faker.datatype.boolean(),
    },
    entryEndDate: {
      date: faker.date.past(),
      isVisible: faker.datatype.boolean(),
      isOnlyYear: faker.datatype.boolean(),
      isCurrentDate: faker.datatype.boolean(),
    },
  })
}

export const generateEntryLocationInput = () => {
  return Prisma.validator<Prisma.EntryLocationUncheckedCreateInput>()({
    city: faker.location.city(),
    country: faker.location.country(),
  })
}

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

export const generateSectionInput = (entryType?: EntryType) => {
  return Prisma.validator<Prisma.SectionUncheckedCreateInput>()({
    title: faker.book.title(),
    entryType: entryType ?? faker.helpers.enumValue(EntryType),
  })
}

export const createAccount = async (
  account: Prisma.AccountUncheckedCreateInput,
) => {
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
