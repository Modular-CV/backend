export const get: RequestHandler = (request, response) => {
  response.status(200).json({
    status: 'SUCCESS',
    message: 'Server is running',
  })
}
