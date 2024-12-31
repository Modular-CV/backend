import server from '../src/server'
import { faker } from '@faker-js/faker'
import supertest from 'supertest'
import { createAccount, generateAccountInput, sleep } from './utils'
import { Routes } from '../src/routes'
import { prisma } from '../src/controllers'

let request: SuperRequest

beforeEach(() => {
  request = supertest.agent(server)
})

afterAll(() => {
  server.close()
})

describe('GET / ', () => {
  it('should return status 200', async () => {
    const response = await request.get(Routes.root)
    expect(response.status).toBe(200)
  })
})

describe('POST /accounts', () => {
  it('should not create an account if the same email already exists and should return status 409', async () => {
    const account = generateAccountInput()

    await createAccount(account)

    const response = await request.post(Routes.accounts).send(account)

    expect(response.status).toBe(409)

    const accountCount = await prisma.account.count({
      where: {
        email: account.email,
      },
    })

    expect(accountCount).toBe(1)
  })

  it('should create an account, send email, return the account and omit the password', async () => {
    const account = generateAccountInput()

    const response = await request.post(Routes.accounts).send(account)

    expect(response.status).toBe(200)

    const {
      data: { account: newAccount },
    } = response.body

    expect(newAccount.id).toBeTruthy()
    expect(newAccount.email).toBe(account.email)
    expect(newAccount.password).toBeFalsy()

    // Wait for nodemailer to finish
  }, 10000)
})

describe('POST /sessions', () => {
  const account = generateAccountInput()

  beforeAll(async () => {
    await createAccount(account)
  })

  it('should return status 200 and the jwts', async () => {
    const response = await request.post(Routes.sessions).send(account)

    const cookies = response.headers['set-cookie']
    expect(cookies.length).toBe(2)
    expect(response.status).toBe(200)
  })

  it('should return status 401 if the email and password do not match', async () => {
    const response = await request.post(Routes.sessions).send({
      email: faker.internet.email(),
      password: faker.internet.password(),
    })

    expect(response.status).toBe(401)
    expect(response.body)
  })
})

describe('GET /sessions/my', () => {
  const account = generateAccountInput()

  beforeAll(async () => {
    await createAccount(account)
  })

  it('should return status 400 if there is no access cookie', async () => {
    const response = await request.get(Routes.mySession)
    expect(response.status).toBe(400)
  })

  it('the expired cookie should be deleted from the browser. status should be 400', async () => {
    const originalAccessTokenMaxAge = process.env.ACCESS_TOKEN_MAX_AGE
    const seconds = 2 * 1000

    process.env.ACCESS_TOKEN_MAX_AGE = seconds

    await request.post(Routes.sessions).send(account)

    await sleep(seconds * 1.25)

    const response = await request.get(Routes.mySession)

    expect(response.status).toBe(400)

    process.env.ACCESS_TOKEN_MAX_AGE = originalAccessTokenMaxAge
  })

  it('should return 200 and the account if the token is valid and the account should not contain the password', async () => {
    await request.post(Routes.sessions).send(account)
    const response = await request.get(Routes.mySession)

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

describe('POST /sessions/my/refresh', () => {
  const account = generateAccountInput()

  beforeAll(async () => {
    await createAccount(account)
  })

  it('should return 400 when there is no refresh token', async () => {
    const response = await request.post(Routes.refreshMySession)

    expect(response.status).toBe(400)
  })

  it('Should return 200 and return the new tokens when a refresh token is used to request a new token', async () => {
    await request.post(Routes.sessions).send(account)
    const response = await request.post(Routes.refreshMySession)

    const cookies = response.headers['set-cookie']
    expect(cookies.length).toBe(2)
    expect(response.status).toBe(200)
  })

  it('should get different tokens for each session refresh', async () => {
    const sessionResponse = await request.post(Routes.sessions).send(account)
    const sessionCookies = sessionResponse.headers['set-cookie']

    await sleep(1000)

    const firstRefreshResponse = await request.post(Routes.refreshMySession)
    const firstRefreshResponseCookies =
      firstRefreshResponse.headers['set-cookie']

    await sleep(1000)

    const secondRefreshResponse = await request.post(Routes.refreshMySession)
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

  it('should return 401 if the user tries to use an old refresh token', async () => {
    const sessionResponse = await request.post(Routes.sessions).send(account)
    const cookies = sessionResponse.headers['set-cookie']
    let oldRefreshToken = ''

    if (Array.isArray(cookies)) {
      oldRefreshToken = cookies.find((cookie: string) =>
        cookie.startsWith('refresh'),
      )
    }

    await sleep(1000)

    await request.post(Routes.refreshMySession)

    const newRequest = supertest.agent(server)

    const refreshResponse = await newRequest
      .post(Routes.refreshMySession)
      .set('Cookie', oldRefreshToken)

    expect(refreshResponse.status).toBe(401)
  })
})
