import supertest from 'supertest'
import server from '../../src/server'
import {
  createAccount,
  generateAccountInput,
  generateSectionInput,
} from '../utils'
import { Route } from '../../src/types'
import { routeParser } from '../../src/utils'
import { faker } from '@faker-js/faker/.'
import { Prisma, Section } from '@prisma/client'

const serverInstance = server.listen()
const request = supertest.agent(serverInstance)

beforeAll(async () => {
  const account = generateAccountInput()
  await createAccount(account)
  await request.post(Route.sessions).send(account)
})

afterAll(() => {
  serverInstance.close()
})

describe('GET ' + Route.mySectionEntries, () => {
  test('should return status 200', async () => {
    const sectionInput = generateSectionInput()
    const sectionResponse = await request
      .post(Route.mySections)
      .send(sectionInput)

    const section: Section = sectionResponse.body.data.section

    const entryResponse = await request.get(
      routeParser(Route.mySectionEntries, ':sectionId', section.id),
    )

    expect(entryResponse.status).toBe(200)
  })
})

describe('POST ' + Route.mySectionEntries, () => {
  test('should return status 200 and the course entry id', async () => {
    const sectionInput = generateSectionInput('COURSE')
    const sectionResponse = await request
      .post(Route.mySections)
      .send(sectionInput)

    const section: Section = sectionResponse.body.data.section

    const courseEntryInput: Prisma.EntryCreateWithoutSectionInput &
      CourseEntryUncheckedCreateInput = {
      entryType: 'COURSE',
      isVisible: true,
      title: faker.book.title(),
      institution: faker.company.name(),
      description: faker.lorem.sentence(),
      entryLocation: {
        city: faker.location.city(),
        country: faker.location.country(),
      },
      entryDate: {
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
      },
    }

    const entryResponse = await request
      .post(routeParser(Route.mySectionEntries, ':sectionId', section.id))
      .send(courseEntryInput)

    expect(entryResponse.status).toBe(200)

    const entry = entryResponse.body.data.entry

    expect(entry.id).toBeTruthy()
  })
})
