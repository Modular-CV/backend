import express from 'express'
import { rootRouter, accountsRouter } from './routes'
import sessionsRouter from './routes/sessions'

const PORT = process.env.PORT
const DOMAIN = process.env.DOMAIN

const server = express()

server.use(express.json())

server.use(accountsRouter)
server.use(rootRouter)
server.use(sessionsRouter)

const serverListenMessage = () => {
  console.log(`\nServer is running on ${DOMAIN}\n`)
}

export default server.listen(PORT, serverListenMessage)
