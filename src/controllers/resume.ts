import { prisma } from '.'

export const get: RequestHandler = async ({ accessToken }, response) => {
  const resumes = await prisma.resume.findMany({
    where: {
      accountId: accessToken?.account.id,
    },
  })

  response.json({
    status: 'SUCCESS',
    data: {
      resumes,
    },
  })
}
