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

resumeRouter.get(
  Route.myResumes,
  authenticateSession,
  controllers.resume.getMyResumes,
)
resumeRouter.get(
  Route.myResumeById,
  authenticateSession,
  controllers.resume.getById,
)
resumeRouter.post(
  Route.myResumes,
  authenticateSession,
  controllers.resume.postMyResume,
)

export const profileRouter = express.Router()

profileRouter.get(
  Route.myProfiles,
  authenticateSession,
  controllers.profile.getMyProfiles,
)
profileRouter.post(
  Route.myProfiles,
  authenticateSession,
  controllers.profile.postMyProfile,
)

export const linkRouter = express.Router()

linkRouter.get(Route.myLinks, authenticateSession, controllers.link.getMyLinks)
linkRouter.post(Route.myLinks, authenticateSession, controllers.link.postMyLink)

export const sectionRouter = express.Router()

sectionRouter.get(
  Route.mySections,
  authenticateSession,
  controllers.section.getMySections,
)

sectionRouter.post(
  Route.mySections,
  authenticateSession,
  controllers.section.postMySection,
)
