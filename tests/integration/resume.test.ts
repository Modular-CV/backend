import { faker } from '@faker-js/faker/.'
import { Routes } from '../../src/routes'
import { routeParser } from '../../src/utils'
import {
  createAccount,
  generateAccountInput,
  generateResumeInput,
} from '../utils'
import supertest from 'supertest'
import server from '../../src/server'

const serverInstance = server.listen()
const request = supertest.agent(serverInstance)

afterAll(() => {
  serverInstance.close()
})

describe('GET ' + Routes.myResumes, () => {
  beforeAll(async () => {
    const account = generateAccountInput()
    await createAccount(account)
    await request.post(Routes.sessions).send(account)
  })

  test('should return status 200', async () => {
    const response = await request.get(Routes.myResumes)

    expect(response.status).toBe(200)
  })
})

describe('POST ' + Routes.resumes, () => {
  beforeAll(async () => {
    const account = generateAccountInput()
    await createAccount(account)
    await request.post(Routes.sessions).send(account)
  })

  test('should return status 200 and the resume with id', async () => {
    const resumeInput = generateResumeInput()

    const response = await request.post(Routes.resumes).send(resumeInput)

    expect(response.status).toBe(200)

    const {
      data: { resume },
    } = response.body

    expect(resume.id).toBeTruthy()
    expect(resume.title).toBe(resumeInput.title)
  })
})

describe('GET ' + Routes.myResumeById, () => {
  beforeAll(async () => {
    const account = generateAccountInput()
    await createAccount(account)
    await request.post(Routes.sessions).send(account)
  })

  test('should return status 404 for resume id not found', async () => {
    const response = await request.get(
      routeParser(Routes.myResumeById, ':resumeId', faker.string.ulid()),
    )
    expect(response.status).toBe(404)
  })

  test('should return status 200 and the resume for a valid resume id', async () => {
    const resumeInput = generateResumeInput()
    const {
      body: {
        data: { resume },
      },
    } = await request.post(Routes.resumes).send(resumeInput)

    const response = await request.get(
      routeParser(Routes.myResumeById, ':resumeId', resume.id),
    )

    const {
      body: { data },
    } = response

    expect(response.status).toBe(200)
    expect(data.resume.id).toBeTruthy()
    expect(data.resume.title).toBe(resumeInput.title)
  })
})
