import express from 'express'
import * as routes from './routes.ts'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const server = express()

server.use(express.json())
server.use(cookieParser())
server.use(
  cors({
    credentials: true,
    origin: ['http://localhost:5173', 'http://localhost:5000'],
  }),
)

for (const router of Object.values(routes)) {
  server.use(router)
}

export default server
