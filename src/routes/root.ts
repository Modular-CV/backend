import express from 'express'

const rootRouter = express.Router()

rootRouter.get('/', (request, response) => {
  response.json('Server is running')
})

export default rootRouter
