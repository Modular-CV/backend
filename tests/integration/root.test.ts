import supertest from 'supertest'
import server from '../../src/server.ts'
import { Route } from '../../src/types.ts'

const serverInstance = server.listen()
const request = supertest.agent(serverInstance)

afterAll(() => {
  serverInstance.close()
})

describe('GET ' + Route.root, () => {
  test('should return status 200', async () => {
    const response = await request.get(Route.root)
    expect(response.status).toBe(200)
  })
})
