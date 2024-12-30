import express from 'express'
import { rootRouter, accountsRouter, sessionsRouter } from './routes'
import cookieParser from 'cookie-parser'

const server = express()

server.use(express.json())
server.use(cookieParser())

server.use(accountsRouter)
server.use(rootRouter)
server.use(sessionsRouter)

const serverListenMessage = () => {
  console.log(`\nServer is running on ${process.env.DOMAIN}\n`)
}

export default server.listen(process.env.PORT, serverListenMessage)
