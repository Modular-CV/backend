import supertest from 'supertest'
import server from '../../src/server'
import { createAccount, generateAccountInput } from '../utils'
import { Prisma } from '@prisma/client'
import { faker } from '@faker-js/faker/.'
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

describe('GET' + Route.myProfiles, () => {
  test('should return status 200', async () => {
    const response = await request.get(Route.myProfiles)
    expect(response.status).toBe(200)
  })
})

describe('POST' + Route.profiles, () => {
  test('should return status 200 and the profile with id', async () => {
    const profileInput =
      Prisma.validator<Prisma.ProfileCreateWithoutAccountInput>()({
        fullName: faker.person.fullName(),
        jobTitle: faker.person.jobTitle(),
        email: faker.internet.email(),
        phone: faker.phone.number({ style: 'international' }),
        address: faker.location.streetAddress(),
      })

    const response = await request.post(Route.profiles).send(profileInput)

    const {
      data: { profile },
    } = response.body

    console.log(profile)

    expect(response.status).toBe(200)
    expect(profile.id).toBeTruthy()
  })
})
