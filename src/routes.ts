import express from 'express'
import {
  accountController,
  rootController,
  sessionController,
} from './controllers'
import { authenticateSessionToken as authenticateSession } from './middlewares'

export const enum Routes {
  root = '/',
  myAccount = '/accounts/my',
  accounts = '/accounts',
  verifyAccount = '/accounts/verify/:token',
  mySession = '/sessions/my',
  sessions = '/sessions',
  refreshMySession = '/sessions/my/refresh',
}

export const rootRouter = express.Router()

rootRouter.get(Routes.root, rootController.get)

export const accountsRouter = express.Router()

accountsRouter.get(Routes.myAccount, authenticateSession, accountController.get)
accountsRouter.post(Routes.verifyAccount, accountController.verify)
accountsRouter.post(Routes.accounts, accountController.post)

export const sessionsRouter = express.Router()

sessionsRouter.get(Routes.mySession, authenticateSession, sessionController.get)
sessionsRouter.post(Routes.refreshMySession, sessionController.refresh)
sessionsRouter.post(Routes.sessions, sessionController.post)
