import supertest from 'supertest'
import { prisma } from '../../src/controllers/index.ts' // Prisma should be imported after Routes - I don't know why
import server from '../../src/server.ts'
import { createAccount, generateAccountInput } from '../utils.ts'
import { Route } from '../../src/types.ts'

const serverInstance = server.listen()
const request = supertest.agent(serverInstance)

afterAll(() => {
  serverInstance.close()
})

describe('POST ' + Route.accounts, () => {
  test('should not create an account if the same email already exists and should return status 409', async () => {
    const account = generateAccountInput()

    await createAccount(account)

    const response = await request.post(Route.accounts).send(account)

    expect(response.status).toBe(409)

    const accountCount = await prisma.account.count({
      where: {
        email: account.email,
      },
    })

    expect(accountCount).toBe(1)
  })

  test('should create an account, send email, return the account and omit the password', async () => {
    const account = generateAccountInput()

    const response = await request.post(Route.accounts).send(account)

    expect(response.status).toBe(200)

    const newAccount = response.body.data.account

    expect(newAccount.id).toBeTruthy()
    expect(newAccount.email).toBe(account.email)
    expect(newAccount.password).toBeFalsy()

    // Wait for nodemailer to finish
  }, 10000)
})

describe('GET ' + Route.myAccount, () => {
  test('should return status 200 and the account id, email and the password should be omitted', async () => {
    const accountInput = generateAccountInput()

    await createAccount(accountInput)

    const sessionResponse = await request
      .post(Route.sessions)
      .send(accountInput)

    const token = sessionResponse.body.data.tokens.accessToken

    const response = await request
      .get(Route.myAccount)
      .auth(token, { type: 'bearer' })

    expect(response.status).toBe(200)

    const account = response.body.data.account

    expect(account.id).toBeTruthy()
    expect(account.email).toBe(accountInput.email)
    expect(account.password).toBeFalsy()
  })
})
