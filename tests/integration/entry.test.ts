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
import { type Section, SkillLevel } from '@prisma/client'

const serverInstance = server.listen()
const request = supertest.agent(serverInstance)

let accessToken = ''

beforeAll(async () => {
  const account = generateAccountInput()
  await createAccount(account)
  const sessionResponse = await request.post(Route.sessions).send(account)

  accessToken = sessionResponse.body.data.tokens.accessToken
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
      .auth(accessToken, { type: 'bearer' })

    const section: Section = sectionResponse.body.data.section

    const entryResponse = await request
      .get(routeParser(Route.mySectionEntries, ':sectionId', section.id))
      .auth(accessToken, { type: 'bearer' })

    expect(entryResponse.status).toBe(200)
  })
})

describe('POST ' + Route.mySectionEntries, () => {
  describe('Custom entry', () => {
    test('should return status 200 and the entry id', async () => {
      const sectionInput = generateSectionInput('CUSTOM')
      const sectionResponse = await request
        .post(Route.mySections)
        .send(sectionInput)
        .auth(accessToken, { type: 'bearer' })

      const section: Section = sectionResponse.body.data.section

      const customEntry: CustomEntryUncheckedCreateInput = {
        entryType: 'CUSTOM',
        isVisible: true,
        customEntry: {
          entryDate: generateEntryDateInput(),
          entryLocation: generateEntryLocationInput(),
          description: faker.lorem.paragraph(),
          subtitle: faker.book.title(),
          title: faker.book.title(),
        },
      }

      const entryResponse = await request
        .post(routeParser(Route.mySectionEntries, ':sectionId', section.id))
        .send(customEntry)
        .auth(accessToken, { type: 'bearer' })

      expect(entryResponse.status).toBe(200)

      const entry = entryResponse.body.data.entry

      expect(entry.id).toBeTruthy()
    })
  })

  describe('Education entry', () => {
    test('should return status 200 and the entry id', async () => {
      const sectionInput = generateSectionInput('EDUCATION')
      const sectionResponse = await request
        .post(Route.mySections)
        .send(sectionInput)
        .auth(accessToken, { type: 'bearer' })

      const section = sectionResponse.body.data.section

      const educationEntry: EducationEntryUncheckedCreateInput = {
        entryType: 'EDUCATION',
        isVisible: true,
        educationEntry: {
          entryDate: generateEntryDateInput(),
          entryLocation: generateEntryLocationInput(),
          degree: faker.person.jobTitle(),
          description: faker.lorem.paragraph(),
          school: faker.company.name(),
        },
      }

      const entryResponse = await request
        .post(routeParser(Route.mySectionEntries, ':sectionId', section.id))
        .send(educationEntry)
        .auth(accessToken, { type: 'bearer' })

      expect(entryResponse.status).toBe(200)

      const entry = entryResponse.body.data.entry

      expect(entry.id).toBeTruthy()
    })
  })

  describe('Course entry', () => {
    test('should return status 200 and the entry id', async () => {
      const sectionInput = generateSectionInput('COURSE')
      const sectionResponse = await request
        .post(Route.mySections)
        .send(sectionInput)
        .auth(accessToken, { type: 'bearer' })

      const section: Section = sectionResponse.body.data.section

      const courseEntry: CourseEntryUncheckedCreateInput = {
        entryType: 'COURSE',
        isVisible: true,
        courseEntry: {
          entryDate: generateEntryDateInput(),
          entryLocation: generateEntryLocationInput(),
          title: faker.book.title(),
          description: faker.lorem.paragraph(),
          institution: faker.company.name(),
        },
      }

      const entryResponse = await request
        .post(routeParser(Route.mySectionEntries, ':sectionId', section.id))
        .send(courseEntry)
        .auth(accessToken, { type: 'bearer' })

      expect(entryResponse.status).toBe(200)

      const entry = entryResponse.body.data.entry

      expect(entry.id).toBeTruthy()
    })
  })

  describe('Professional Experience entry', () => {
    test('should return status 200 and the entry id', async () => {
      const sectionInput = generateSectionInput('PROFESSIONAL_EXPERIENCE')
      const sectionResponse = await request
        .post(Route.mySections)
        .send(sectionInput)
        .auth(accessToken, { type: 'bearer' })

      const section: Section = sectionResponse.body.data.section

      const professionalExperienceEntry: ProfessionalExperienceEntryUncheckedCreateInput =
        {
          entryType: 'PROFESSIONAL_EXPERIENCE',
          isVisible: true,
          professionalExperienceEntry: {
            entryDate: generateEntryDateInput(),
            entryLocation: generateEntryLocationInput(),
            description: faker.lorem.paragraph(),
            employer: faker.company.name(),
            jobTitle: faker.person.jobTitle(),
          },
        }

      const entryResponse = await request
        .post(routeParser(Route.mySectionEntries, ':sectionId', section.id))
        .send(professionalExperienceEntry)
        .auth(accessToken, { type: 'bearer' })

      expect(entryResponse.status).toBe(200)

      const entry = entryResponse.body.data.entry

      expect(entry.id).toBeTruthy()
    })
  })

  describe('Project entry', () => {
    test('should return status 200 and the entry id', async () => {
      const sectionInput = generateSectionInput('PROJECT')
      const sectionResponse = await request
        .post(Route.mySections)
        .send(sectionInput)
        .auth(accessToken, { type: 'bearer' })

      const section: Section = sectionResponse.body.data.section

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
        .auth(accessToken, { type: 'bearer' })

      expect(entryResponse.status).toBe(200)

      const entry = entryResponse.body.data.entry

      expect(entry.id).toBeTruthy()
    })
  })

  describe('Skill entry', () => {
    test('should return status 200 and the entry id', async () => {
      const sectionInput = generateSectionInput('SKILL')
      const sectionResponse = await request
        .post(Route.mySections)
        .send(sectionInput)
        .auth(accessToken, { type: 'bearer' })

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
        .auth(accessToken, { type: 'bearer' })

      expect(entryResponse.status).toBe(200)

      const entry = entryResponse.body.data.entry

      expect(entry.id).toBeTruthy()
    })
  })

  describe('Course entry', () => {
    test('should return status 200 and the entry id', async () => {
      const sectionInput = generateSectionInput('COURSE')
      const sectionResponse = await request
        .post(Route.mySections)
        .send(sectionInput)
        .auth(accessToken, { type: 'bearer' })

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
        .auth(accessToken, { type: 'bearer' })

      expect(entryResponse.status).toBe(200)

      const entry = entryResponse.body.data.entry

      expect(entry.id).toBeTruthy()
    })
  })
})
