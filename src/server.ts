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
server.use(routes.profileRouter)
server.use(routes.linkRouter)

export default server
