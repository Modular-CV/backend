import express from 'express'
import { rootRouter, accountsRouter, sessionsRouter } from './routes'

const server = express()

server.use(express.json())

server.use(accountsRouter)
server.use(rootRouter)
server.use(sessionsRouter)

const DOMAIN = process.env.DOMAIN

const serverListenMessage = () => {
  console.log(`\nServer is running on ${DOMAIN}\n`)
}

const PORT = process.env.PORT

export default server.listen(PORT, serverListenMessage)
