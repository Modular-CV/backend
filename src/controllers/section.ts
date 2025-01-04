import { prisma } from '.'

export const getMySections: RequestHandler = ({ accessToken }, response) => {
  const sections = prisma.section.findMany({
    where: {
      accountId: accessToken?.account.id,
    },
  })

  response.json({
    status: 'SUCCESS',
    data: {
      sections,
    },
  })
}
