import supertest from 'supertest'
import server from '../../src/server'
import {
  createAccount,
  generateAccountInput,
  generateSectionInput,
} from '../utils'
import { Route } from '../../src/types'

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
  test('should return 200', async () => {
    const response = await request.get(Route.mySections)
    expect(response.status).toBe(200)
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
