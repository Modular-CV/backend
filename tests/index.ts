import supertest from 'supertest'
import server from '../src/server'

const request = supertest.agent(server)

afterAll(() => {
  server.close()
})

describe('GET / ', () => {
  it('should return status 200', async () => {
    if (!request) return false
    const response = await request.get('/')
    expect(response.status).toBe(200)
  })
})
