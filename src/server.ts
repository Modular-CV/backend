import express from 'express'
import crypto from 'crypto'
import { rootRouter, accountsRouter } from './routes'

if (!process.env.TOKEN_SECRET)
  process.env.TOKEN_SECRET = crypto.randomBytes(64).toString('hex')

const PORT = process.env.PORT
const DOMAIN = process.env.DOMAIN

const server = express()

server.use(express.json())

server.use(rootRouter)
server.use(accountsRouter)

const serverListenMessage = () => {
  console.log(`\nServer is running on ${DOMAIN}\n`)
}

export default server.listen(PORT, serverListenMessage)
