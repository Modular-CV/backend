import supertest from 'supertest'
import server from '../../src/server'
import { createAccount, generateAccountInput } from '../utils'
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

describe('GET ' + Route.sections, () => {
  test('should return 200', async () => {
    const response = await request.get(Route.sections)
    expect(response.status).toBe(200)
  })
})
