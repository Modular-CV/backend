import express from 'express'
import {
  accountController,
  rootController,
  sessionController,
  resumeController,
  profileController,
  linkController,
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
  resumes = '/resumes',
  myResumes = '/my/resumes',
  myResumeById = '/my/resumes/:resumeId',
  profiles = '/profiles',
  myProfiles = '/my/profiles',
  links = '/links',
  myLinks = '/my/links',
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

export const resumeRouter = express.Router()

resumeRouter.get(Routes.myResumes, authenticateSession, resumeController.get)
resumeRouter.get(
  Routes.myResumeById,
  authenticateSession,
  resumeController.getById,
)
resumeRouter.post(Routes.resumes, authenticateSession, resumeController.post)

export const profileRouter = express.Router()

profileRouter.get(Routes.myProfiles, authenticateSession, profileController.get)
profileRouter.post(Routes.profiles, authenticateSession, profileController.post)

export const linkRouter = express.Router()

linkRouter.get(Routes.myLinks, authenticateSession, linkController.get)
linkRouter.post(Routes.links, authenticateSession, linkController.post)
