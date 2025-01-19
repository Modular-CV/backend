import supertest from 'supertest'
import server from '../../src/server.ts'
import {
  createAccount,
  generateAccountInput,
  generateSectionInput,
} from '../utils.ts'
import { Route } from '../../src/types.ts'

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

describe('GET ' + Route.mySections, () => {
  test('should return 200 and an array', async () => {
    const response = await request.get(Route.mySections)
    expect(response.status).toBe(200)

    const sections = response.body.data.sections

    expect(Array.isArray(sections)).toBeTruthy()
  })
})

describe('POST' + Route.mySections, () => {
  test('should return 200 and the section id', async () => {
    const sectionInput = generateSectionInput()
    const response = await request.post(Route.mySections).send(sectionInput)

    expect(response.status).toBe(200)

    const section = response.body.data.section

    expect(section.id).toBeTruthy()
  })
})
