import supertest from 'supertest'
import { prisma } from '../../src/controllers' // Prisma should be imported after Routes - I don't know why
import server from '../../src/server'
import { createAccount, generateAccountInput } from '../utils'
import { Route } from '../../src/types'

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

    const {
      data: { account: newAccount },
    } = response.body

    expect(newAccount.id).toBeTruthy()
    expect(newAccount.email).toBe(account.email)
    expect(newAccount.password).toBeFalsy()

    // Wait for nodemailer to finish
  }, 10000)
})
