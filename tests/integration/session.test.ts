import { faker } from '@faker-js/faker'
import supertest from 'supertest'
import { generateAccountInput, createAccount, sleep } from '../utils.ts'
import server from '../../src/server.ts'
import { Route } from '../../src/types.ts'

const serverInstance = server.listen()
let request = supertest.agent(serverInstance)

afterAll(() => {
  serverInstance.close()
})

afterEach(() => {
  request = supertest.agent(serverInstance)
})

describe('POST ' + Route.sessions, () => {
  const accountInput = generateAccountInput()

  beforeAll(async () => {
    await createAccount(accountInput)
  })

  test('should return status 200 and the jwts', async () => {
    const response = await request.post(Route.sessions).send(accountInput)

    expect(response.status).toBe(200)

    const cookies = response.headers['set-cookie']

    expect(cookies.length).toBe(2)

    for (const cookie of cookies) {
      expect(cookie.includes('HttpOnly')).toBeTruthy()
      expect(cookie.includes('SameSite=None')).toBeTruthy()
      expect(cookie.includes('Secure')).toBeTruthy()
    }

    const { accessToken, refreshToken } = response.body.data.tokens

    expect(accessToken).toBeTruthy()
    expect(refreshToken).toBeTruthy()
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
  const accountInput = generateAccountInput()

  beforeAll(async () => {
    await createAccount(accountInput)
  })

  test('should return status 400 if there is no access token', async () => {
    const response = await request.get(Route.mySession)
    expect(response.status).toBe(400)
  })

  test('should return status 400 for expired token', async () => {
    const originalAccessTokenMaxAge = process.env.ACCESS_TOKEN_MAX_AGE
    const seconds = 2 * 1000

    process.env.ACCESS_TOKEN_MAX_AGE = seconds.toString()

    const sessionResponse = await request
      .post(Route.sessions)
      .send(accountInput)

    const accessToken = sessionResponse.body.data.tokens.accessToken

    await sleep(seconds * 1.25)

    const response = await request
      .get(Route.mySession)
      .auth(accessToken, { type: 'bearer' })

    expect(response.status).toBe(401)

    process.env.ACCESS_TOKEN_MAX_AGE = originalAccessTokenMaxAge
  })

  test('should return 200 and the jwtPayload with the account if the token is valid and the account should not contain the password', async () => {
    const sessionResponse = await request
      .post(Route.sessions)
      .send(accountInput)

    const accessToken = sessionResponse.body.data.tokens.accessToken

    const response = await request.get(Route.mySession).auth(accessToken, {
      type: 'bearer',
    })

    expect(response.status).toBe(200)

    const account = response.body.data.jwtPayload.account

    expect(account.email).toBe(accountInput.email)
    expect(account.password).toBeFalsy()
  })
})

describe('POST ' + Route.refreshMySession, () => {
  const accountInput = generateAccountInput()

  beforeAll(async () => {
    await createAccount(accountInput)
  })

  test('should return 400 when there is no refresh token', async () => {
    const response = await request.post(Route.refreshMySession)

    expect(response.status).toBe(400)
  })

  test('Should return 200 and return the new tokens when a refresh token is used to request a new token', async () => {
    const sessionResponse = await request
      .post(Route.sessions)
      .send(accountInput)

    const currentRefreshToken = sessionResponse.body.data.tokens.refreshToken

    const response = await request
      .post(Route.refreshMySession)
      .auth(currentRefreshToken, { type: 'bearer' })

    const cookies = response.headers['set-cookie']
    expect(cookies.length).toBe(2)
    expect(response.status).toBe(200)

    const { accessToken, refreshToken } = response.body.data.tokens

    expect(accessToken).toBeTruthy()
    expect(refreshToken).toBeTruthy()
  })

  test('should get different tokens for each session refresh', async () => {
    const sessionResponse = await request
      .post(Route.sessions)
      .send(accountInput)
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
    const sessionResponse = await request
      .post(Route.sessions)
      .send(accountInput)

    const oldRefreshToken = sessionResponse.body.data.refreshToken

    await sleep(1000)

    await request
      .post(Route.refreshMySession)
      .auth(oldRefreshToken, { type: 'bearer' })

    const newRequest = supertest.agent(serverInstance)

    const refreshResponse = await newRequest
      .post(Route.refreshMySession)
      .auth(oldRefreshToken, { type: 'bearer' })

    expect(refreshResponse.status).toBe(401)
  })
})

describe('DELETE ' + Route.mySession, () => {
  const accountInput = generateAccountInput()

  beforeAll(async () => {
    await createAccount(accountInput)
  })

  test('should return 200 and delete the tokens', async () => {
    const sessionResponse = await request
      .post(Route.sessions)
      .send(accountInput)

    console.log(sessionResponse.body)

    const accessToken = sessionResponse.body.data.tokens.accessToken

    const response = await request
      .delete(Route.mySession)
      .auth(accessToken, { type: 'bearer' })

    expect(response.status).toBe(200)
  })

  test('after delete refreshToken, the refresh endpoint should return 401', async () => {
    const sessionResponse = await request
      .post(Route.sessions)
      .send(accountInput)

    const { accessToken, refreshToken } = sessionResponse.body.data.tokens

    await request.delete(Route.mySession).auth(accessToken, { type: 'bearer' })

    const response = await request
      .post(Route.refreshMySession)
      .auth(refreshToken, { type: 'bearer' })

    expect(response.status).toBe(401)
  })
})
