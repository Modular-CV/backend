import supertest from 'supertest'
import server from '../../src/server.ts'
import {
  createAccount,
  generateAccountInput,
  generateEntryDateInput,
  generateEntryLocationInput,
  generateSectionInput,
} from '../utils.ts'
import { Route } from '../../src/types.ts'
import { routeParser } from '../../src/utils.ts'
import { faker } from '@faker-js/faker'
import { type EntryDate, type Section, SkillLevel } from '@prisma/client'

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
  describe('Project entry', () => {
    test('should return status 200 and the skill id', async () => {
      const sectionInput = generateSectionInput('PROJECT')
      const sectionResponse = await request
        .post(Route.mySections)
        .send(sectionInput)

      const section: EntryDate = sectionResponse.body.data.section

      const projectEntry: ProjectEntryUncheckedCreateInput = {
        entryType: 'PROJECT',
        isVisible: true,
        projectEntry: {
          title: faker.book.title(),
          subtitle: faker.book.publisher(),
          description: faker.lorem.paragraph(),
          entryDate: generateEntryDateInput(),
        },
      }

      const entryResponse = await request
        .post(routeParser(Route.mySectionEntries, ':sectionId', section.id))
        .send(projectEntry)

      expect(entryResponse.status).toBe(200)

      const entry = entryResponse.body.data.entry

      expect(entry.id).toBeTruthy()
    })
  })

  describe('Skill entry', () => {
    test('should return status 200 and the skill id', async () => {
      const sectionInput = generateSectionInput('SKILL')
      const sectionResponse = await request
        .post(Route.mySections)
        .send(sectionInput)

      const section: Section = sectionResponse.body.data.section

      const skillEntryInput: SkillEntryUncheckedCreateInput = {
        entryType: 'SKILL',
        isVisible: true,
        skillEntry: {
          name: faker.person.jobArea(),
          information: faker.person.jobDescriptor(),
          skillLevel: faker.helpers.enumValue(SkillLevel),
        },
      }

      const entryResponse = await request
        .post(routeParser(Route.mySectionEntries, ':sectionId', section.id))
        .send(skillEntryInput)

      expect(entryResponse.status).toBe(200)

      const entry = entryResponse.body.data.entry

      expect(entry.id).toBeTruthy()
    })
  })

  describe('Course entry', () => {
    test('should return status 200 and the course entry id', async () => {
      const sectionInput = generateSectionInput('COURSE')
      const sectionResponse = await request
        .post(Route.mySections)
        .send(sectionInput)

      const section: Section = sectionResponse.body.data.section

      const courseEntryInput: CourseEntryUncheckedCreateInput = {
        entryType: 'COURSE',
        isVisible: true,
        courseEntry: {
          title: faker.book.title(),
          institution: faker.company.name(),
          description: faker.lorem.sentence(),
          entryLocation: generateEntryLocationInput(),
          entryDate: generateEntryDateInput(),
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
})
