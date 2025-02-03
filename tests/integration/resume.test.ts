import { faker } from '@faker-js/faker'
import { routeParser } from '../../src/utils.ts'
import {
  createAccount,
  generateAccountInput,
  generateResumeInput,
} from '../utils.ts'
import supertest from 'supertest'
import server from '../../src/server.ts'
import { Route } from '../../src/types.ts'

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

describe('GET ' + Route.myResumes, () => {
  test('should return status 200', async () => {
    const response = await request
      .get(Route.myResumes)
      .auth(accessToken, { type: 'bearer' })

    expect(response.status).toBe(200)
  })
})

describe('POST ' + Route.myResumes, () => {
  test('should return status 200 and the resume with id', async () => {
    const resumeInput = generateResumeInput()

    const response = await request
      .post(Route.myResumes)
      .send(resumeInput)
      .auth(accessToken, { type: 'bearer' })

    expect(response.status).toBe(200)

    const resume = response.body.data.resume

    expect(resume.id).toBeTruthy()
    expect(resume.title).toBe(resumeInput.title)
  })

  test('should return status 400 for empty title', async () => {
    const resumeInput = generateResumeInput()
    resumeInput.title = ''

    const response = await request
      .post(Route.myResumes)
      .send(resumeInput)
      .auth(accessToken, { type: 'bearer' })

    expect(response.status).toBe(400)
  })
})

describe('GET ' + Route.myResumeById, () => {
  test('should return status 404 for resume id not found', async () => {
    const response = await request
      .get(routeParser(Route.myResumeById, ':resumeId', faker.string.ulid()))
      .auth(accessToken, {
        type: 'bearer',
      })
    expect(response.status).toBe(404)
  })

  test('should return status 200 and the resume for a valid resume id', async () => {
    const resumeInput = generateResumeInput()
    const firstResponse = await request
      .post(Route.myResumes)
      .send(resumeInput)
      .auth(accessToken, {
        type: 'bearer',
      })

    const resumeId = firstResponse.body.data.resume.id

    const secondResponse = await request
      .get(routeParser(Route.myResumeById, ':resumeId', resumeId))
      .auth(accessToken, { type: 'bearer' })

    expect(secondResponse.status).toBe(200)

    const resume = secondResponse.body.data.resume

    expect(resume.id).toBeTruthy()
    expect(resume.title).toBe(resumeInput.title)
  })
})
