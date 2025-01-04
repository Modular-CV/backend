import express from 'express'
import * as routes from './routes'
import cookieParser from 'cookie-parser'

const server = express()

server.use(express.json())
server.use(cookieParser())

for (const router of Object.values(routes)) {
  server.use(router)
}

export default server
