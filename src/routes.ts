import express from 'express'
import * as controllers from './controllers'
import { authenticateSessionToken as authenticateSession } from './middlewares'
import { Route } from './types'

export const rootRouter = express.Router()

rootRouter.get(Route.root, controllers.root.get)

export const accountsRouter = express.Router()

accountsRouter.get(
  Route.myAccount,
  authenticateSession,
  controllers.account.get,
)
accountsRouter.post(Route.verifyAccount, controllers.account.verify)
accountsRouter.post(Route.accounts, controllers.account.post)

export const sessionsRouter = express.Router()

sessionsRouter.get(
  Route.mySession,
  authenticateSession,
  controllers.session.get,
)
sessionsRouter.post(Route.refreshMySession, controllers.session.refresh)
sessionsRouter.post(Route.sessions, controllers.session.post)

export const resumeRouter = express.Router()

resumeRouter.get(Route.myResumes, authenticateSession, controllers.resume.get)
resumeRouter.get(
  Route.myResumeById,
  authenticateSession,
  controllers.resume.getById,
)
resumeRouter.post(Route.resumes, authenticateSession, controllers.resume.post)

export const profileRouter = express.Router()

profileRouter.get(
  Route.myProfiles,
  authenticateSession,
  controllers.profile.get,
)
profileRouter.post(
  Route.profiles,
  authenticateSession,
  controllers.profile.post,
)

export const linkRouter = express.Router()

linkRouter.get(Route.myLinks, authenticateSession, controllers.link.get)
linkRouter.post(Route.links, authenticateSession, controllers.link.post)

export const sectionRouter = express.Router()

sectionRouter.get(Route.sections, authenticateSession, controllers.section.get)
