import { faker } from '@faker-js/faker/.'
import supertest from 'supertest'
import { generateAccountInput, createAccount, sleep } from '../utils'
import server from '../../src/server'
import { Route } from '../../src/types'

const serverInstance = server.listen()
let request = supertest.agent(serverInstance)

afterAll(() => {
  serverInstance.close()
})

afterEach(() => {
  request = supertest.agent(serverInstance)
})

describe('POST ' + Route.sessions, () => {
  const account = generateAccountInput()

  beforeAll(async () => {
    await createAccount(account)
  })

  test('should return status 200 and the jwts', async () => {
    const response = await request.post(Route.sessions).send(account)

    const cookies = response.headers['set-cookie']
    expect(cookies.length).toBe(2)
    expect(response.status).toBe(200)
  })

  test('should return status 401 if the email and password do not match', async () => {
    const response = await request.post(Route.sessions).send({
      email: faker.internet.email(),
      password: faker.internet.password(),
    })

    expect(response.status).toBe(401)
    expect(response.body)
  })
})

describe('GET ' + Route.mySession, () => {
  const account = generateAccountInput()

  beforeAll(async () => {
    await createAccount(account)
  })

  test('should return status 400 if there is no access cookie', async () => {
    const response = await request.get(Route.mySession)
    expect(response.status).toBe(400)
  })

  test('the expired cookie should be deleted from the browser. status should be 400', async () => {
    const originalAccessTokenMaxAge = process.env.ACCESS_TOKEN_MAX_AGE
    const seconds = 2 * 1000

    process.env.ACCESS_TOKEN_MAX_AGE = seconds

    await request.post(Route.sessions).send(account)

    await sleep(seconds * 1.25)

    const response = await request.get(Route.mySession)

    expect(response.status).toBe(400)

    process.env.ACCESS_TOKEN_MAX_AGE = originalAccessTokenMaxAge
  })

  test('should return 200 and the account if the token is valid and the account should not contain the password', async () => {
    await request.post(Route.sessions).send(account)
    const response = await request.get(Route.mySession)

    expect(response.status).toBe(200)

    const {
      data: {
        accessToken: { account: accountResponse },
      },
    } = response.body

    expect(accountResponse.email).toBe(account.email)
    expect(accountResponse.password).toBeFalsy()
  })
})

describe('POST ' + Route.refreshMySession, () => {
  const account = generateAccountInput()

  beforeAll(async () => {
    await createAccount(account)
  })

  test('should return 400 when there is no refresh token', async () => {
    const response = await request.post(Route.refreshMySession)

    expect(response.status).toBe(400)
  })

  test('Should return 200 and return the new tokens when a refresh token is used to request a new token', async () => {
    await request.post(Route.sessions).send(account)
    const response = await request.post(Route.refreshMySession)

    const cookies = response.headers['set-cookie']
    expect(cookies.length).toBe(2)
    expect(response.status).toBe(200)
  })

  test('should get different tokens for each session refresh', async () => {
    const sessionResponse = await request.post(Route.sessions).send(account)
    const sessionCookies = sessionResponse.headers['set-cookie']

    await sleep(1000)

    const firstRefreshResponse = await request.post(Route.refreshMySession)
    const firstRefreshResponseCookies =
      firstRefreshResponse.headers['set-cookie']

    await sleep(1000)

    const secondRefreshResponse = await request.post(Route.refreshMySession)
    const secondRefreshResponseCookies =
      secondRefreshResponse.headers['set-cookie']

    const areTheyArray =
      Array.isArray(sessionCookies) &&
      Array.isArray(firstRefreshResponseCookies) &&
      Array.isArray(secondRefreshResponseCookies)

    const isAccessTokensEqual = (cookiesA: string[], cookiesB: string[]) =>
      cookiesA.find((cookie: string) => cookie.startsWith('access')) ===
      cookiesB.find((cookie: string) => cookie.startsWith('access'))

    if (areTheyArray) {
      expect(
        isAccessTokensEqual(sessionCookies, firstRefreshResponseCookies),
      ).toBeFalsy()

      expect(
        isAccessTokensEqual(
          firstRefreshResponseCookies,
          secondRefreshResponseCookies,
        ),
      ).toBeFalsy()
    }
  })

  test('should return 401 if the user tries to use an old refresh token', async () => {
    const sessionResponse = await request.post(Route.sessions).send(account)
    const cookies = sessionResponse.headers['set-cookie']
    let oldRefreshToken = ''

    if (Array.isArray(cookies)) {
      oldRefreshToken = cookies.find((cookie: string) =>
        cookie.startsWith('refresh'),
      )
    }

    await sleep(1000)

    await request.post(Route.refreshMySession)

    const newRequest = supertest.agent(serverInstance)

    const refreshResponse = await newRequest
      .post(Route.refreshMySession)
      .set('Cookie', oldRefreshToken)

    expect(refreshResponse.status).toBe(401)
  })
})
