import server from '../src/server'
import { Prisma } from '@prisma/client'
import { faker } from '@faker-js/faker'
import supertest from 'supertest'
import { createAccount, generateAccountInput } from './utils'
import { Routes } from '../src/routes'

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
  it('should create an account, send email, return the account and omit the password', async () => {
    const account: Prisma.AccountCreateInput = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    }

    const response = await request.post(Routes.accounts).send(account)

    const {
      data: { account: newAccount },
    } = response.body

    expect(response.status).toBe(200)
    expect(newAccount.id).toBeTruthy()
    expect(newAccount.email).toBe(account.email)
    expect(newAccount.password).toBeFalsy()

    // Wait for nodemailer to finish
  }, 10000)
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
    await new Promise((resolve) => setTimeout(resolve, seconds * 1.25))

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
})

describe('POST /sessions', () => {
  const account = generateAccountInput()

  beforeAll(async () => {
    await createAccount(account)
  })

  it('should return the account and the jwts without the password if the email and password match', async () => {
    const response = await request.post(Routes.sessions).send(account)

    const {
      data: { account: accountResponse },
    } = response.body

    const cookies = response.headers['set-cookie']
    expect(cookies.length).toBe(2)
    expect(response.status).toBe(200)
    expect(accountResponse.email).toBe(account.email)
    expect(accountResponse.password).toBeFalsy()
  })

  it('Should return status 401 if the email and password do not match', async () => {
    const response = await request.post(Routes.sessions).send({
      email: faker.internet.email(),
      password: faker.internet.password(),
    })

    expect(response.status).toBe(401)
    expect(response.body)
  })
})
