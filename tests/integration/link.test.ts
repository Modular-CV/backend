import supertest from 'supertest'
import server from '../../src/server'
import { createAccount, generateAccountInput } from '../utils'
import { Prisma } from '@prisma/client'
import { faker } from '@faker-js/faker/.'
import { Route } from '../../src/types'

const serverInstance = server.listen()
const request: SuperRequest = supertest.agent(serverInstance)

beforeAll(async () => {
  const account = generateAccountInput()
  await createAccount(account)
  await request.post(Route.sessions).send(account)
})

afterAll(() => {
  serverInstance.close()
})

describe('GET ' + Route.myLinks, () => {
  test('should return status 200', async () => {
    const response = await request.get(Route.myLinks)
    expect(response.status).toBe(200)
  })
})

describe('POST ' + Route.myLinks, () => {
  test('should return status 200 and the link id', async () => {
    const linkInput =
      Prisma.validator<Prisma.LinkUncheckedCreateWithoutAccountInput>()({
        url: faker.internet.url(),
      })

    const response = await request.post(Route.myLinks).send(linkInput)

    expect(response.status).toBe(200)

    const link = response.body.data.link

    expect(link.id).toBeTruthy()
  })
})
