import supertest from 'supertest'
import server from '../../src/server.ts'
import { createAccount, generateAccountInput } from '../utils.ts'
import { Prisma } from '@prisma/client'
import { faker } from '@faker-js/faker'
import { Route } from '../../src/types.ts'

const serverInstance = server.listen()
const request = supertest.agent(serverInstance)

let accessToken = ''

beforeAll(async () => {
  const account = generateAccountInput()
  await createAccount(account)
  const sessionResponse = await request.post(Route.sessions).send(account)

  accessToken = sessionResponse.body.data.accessToken
})

afterAll(() => {
  serverInstance.close()
})

describe('GET' + Route.myProfiles, () => {
  test('should return status 200', async () => {
    const response = await request
      .get(Route.myProfiles)
      .auth(accessToken, { type: 'bearer' })

    expect(response.status).toBe(200)
  })
})

describe('POST' + Route.myProfiles, () => {
  test('should return status 200 and the profile with id', async () => {
    const profileInput =
      Prisma.validator<Prisma.ProfileUncheckedCreateWithoutAccountInput>()({
        fullName: faker.person.fullName(),
        jobTitle: faker.person.jobTitle(),
        email: faker.internet.email(),
        phone: faker.phone.number({ style: 'international' }),
        address: faker.location.streetAddress(),
      })

    const response = await request
      .post(Route.myProfiles)
      .send(profileInput)
      .auth(accessToken, { type: 'bearer' })

    expect(response.status).toBe(200)

    const profile = response.body.data.profile

    expect(profile.id).toBeTruthy()
  })
})
