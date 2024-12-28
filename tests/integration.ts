import supertest from 'supertest'
import server from '../src/server'
import { execSync } from 'child_process'
import { Prisma } from '@prisma/client'
import { faker } from '@faker-js/faker'
import { prisma } from '../src/controllers'
import { generateSecurePassword } from '../src/utils'

const request = supertest.agent(server)

afterAll(() => {
  server.close()
  execSync('yarn migrate:reset --force', { stdio: 'inherit' })
})

describe('GET / ', () => {
  it('should return status 200', async () => {
    const response = await request.get('/')
    expect(response.status).toBe(200)
  })
})

describe('POST /accounts', () => {
  it('should create an account, send email, return the account and omit the password', async () => {
    const account: Prisma.AccountCreateInput = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    }

    const response = await request.post('/accounts').send(account)

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

describe('GET /sessions', () => {
  it('should return status 400 if there is no authorization header', async () => {
    const response = await request.get('/sessions')
    expect(response.status).toBe(400)
  })

  it('should return 400 if there is no token', async () => {
    const response = await request
      .get('/sessions')
      .set({ authorization: 'Bearer ' })
    expect(response.status).toBe(400)
  })

  it('should return 403 if the token is invalid', async () => {
    const response = await request
      .get('/sessions')
      .set({ authorization: 'Bearer 123' })
    expect(response.status).toBe(403)
  })
})

describe('POST /sessions', () => {
  const account: Prisma.AccountCreateInput = {
    email: faker.internet.email(),
    password: faker.internet.password(),
  }

  beforeAll(async () => {
    await prisma.account.create({
      data: {
        email: account.email,
        password: await generateSecurePassword(account.password),
      },
    })
  })

  it('should return the account without the password if the email and password match', async () => {
    const response = await request.post('/sessions').send(account)

    const {
      data: { account: accountResponse },
    } = response.body

    expect(response.status).toBe(200)
    expect(accountResponse.email).toBe(account.email)
  })

  it('Should return status 401 if the email and password do not match', async () => {
    const response = await request.post('/sessions').send({
      email: faker.internet.email(),
      password: faker.internet.password(),
    })

    expect(response.status).toBe(401)
    expect(response.body)
  })
})
