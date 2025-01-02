import supertest from 'supertest'
import { Routes } from '../../src/routes'
import server from '../../src/server'

const serverInstance = server.listen()
const request = supertest.agent(serverInstance)

afterAll(() => {
  serverInstance.close()
})

describe('GET ' + Routes.root, () => {
  test('should return status 200', async () => {
    const response = await request.get(Routes.root)
    expect(response.status).toBe(200)
  })
})
