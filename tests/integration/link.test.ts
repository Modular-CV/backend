import supertest from 'supertest'
import server from '../../src/server'
import { Routes } from '../../src/routes'
import { createAccount, generateAccountInput } from '../utils'
import { Prisma } from '@prisma/client'
import { faker } from '@faker-js/faker/.'

const serverInstance = server.listen()
const request: SuperRequest = supertest.agent(serverInstance)

beforeAll(async () => {
  const account = generateAccountInput()
  await createAccount(account)
  await request.post(Routes.sessions).send(account)
})

afterAll(() => {
  serverInstance.close()
})

describe('GET ' + Routes.myLinks, () => {
  test('should return status 200', async () => {
    const response = await request.get(Routes.myLinks)
    expect(response.status).toBe(200)
  })
})

describe('POST ' + Routes.links, () => {
  test('should return status 200 and the link id', async () => {
    const linkInput = Prisma.validator<Prisma.LinkCreateWithoutAccountInput>()({
      url: faker.internet.url(),
    })

    const response = await request.post(Routes.links).send(linkInput)

    expect(response.status).toBe(200)

    const {
      data: { link },
    } = response.body

    expect(link.id).toBeTruthy()
  })
})
