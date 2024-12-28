import express from 'express'
import {
  accountController,
  rootController,
  sessionController,
} from './controllers'
import { authenticateSessionToken } from './middlewares'

export const rootRouter = express.Router()

rootRouter.get('/', rootController.get)

export const accountsRouter = express.Router()

accountsRouter.get('/accounts', accountController.get)
accountsRouter.post('/accounts', accountController.post)

export const sessionsRouter = express.Router()

sessionsRouter.get('/sessions', authenticateSessionToken)
sessionsRouter.post('/sessions', sessionController.post)
