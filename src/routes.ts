import express from 'express'
import * as controllers from './controllers'
import { authenticateSessionToken as authenticateSession } from './middlewares'

export const enum Routes {
  root = '/',
  myAccount = '/accounts/my',
  accounts = '/accounts',
  verifyAccount = '/accounts/verify/:token',
  mySession = '/sessions/my',
  sessions = '/sessions',
  refreshMySession = '/sessions/my/refresh',
  resumes = '/resumes',
  myResumes = '/my/resumes',
  myResumeById = '/my/resumes/:resumeId',
  profiles = '/profiles',
  myProfiles = '/my/profiles',
  links = '/links',
  myLinks = '/my/links',
}

export const rootRouter = express.Router()

rootRouter.get(Routes.root, controllers.root.get)

export const accountsRouter = express.Router()

accountsRouter.get(
  Routes.myAccount,
  authenticateSession,
  controllers.account.get,
)
accountsRouter.post(Routes.verifyAccount, controllers.account.verify)
accountsRouter.post(Routes.accounts, controllers.account.post)

export const sessionsRouter = express.Router()

sessionsRouter.get(
  Routes.mySession,
  authenticateSession,
  controllers.session.get,
)
sessionsRouter.post(Routes.refreshMySession, controllers.session.refresh)
sessionsRouter.post(Routes.sessions, controllers.session.post)

export const resumeRouter = express.Router()

resumeRouter.get(Routes.myResumes, authenticateSession, controllers.resume.get)
resumeRouter.get(
  Routes.myResumeById,
  authenticateSession,
  controllers.resume.getById,
)
resumeRouter.post(Routes.resumes, authenticateSession, controllers.resume.post)

export const profileRouter = express.Router()

profileRouter.get(
  Routes.myProfiles,
  authenticateSession,
  controllers.profile.get,
)
profileRouter.post(
  Routes.profiles,
  authenticateSession,
  controllers.profile.post,
)

export const linkRouter = express.Router()

linkRouter.get(Routes.myLinks, authenticateSession, controllers.link.get)
linkRouter.post(Routes.links, authenticateSession, controllers.link.post)
