import express from 'express'
import * as routes from './routes'
import cookieParser from 'cookie-parser'

const server = express()

server.use(express.json())
server.use(cookieParser())

server.use(routes.rootRouter)
server.use(routes.accountsRouter)
server.use(routes.sessionsRouter)
server.use(routes.resumeRouter)

const serverListenMessage = () => {
  console.log(`\nServer is running on ${process.env.DOMAIN}\n`)
}

export default server.listen(process.env.PORT, serverListenMessage)
