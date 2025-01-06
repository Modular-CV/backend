import { z } from 'zod'
import { prisma } from '.'
import { ErrorCode } from '../types'
import { Prisma, SkillLevel } from '@prisma/client'
import { normalizeOutput } from '../utils'

export const getMySectionEntries: RequestHandler = (
  { accessToken, params },
  response,
) => {
  const sectionId = params.sectionId

  const sectionEntries = prisma.entry.findMany({
    where: {
      sectionId: sectionId,
      Section: {
        Account: {
          id: accessToken?.account.id,
        },
      },
    },
  })

  response.json({
    status: 'SUCCESS',
    data: {
      sectionEntries,
    },
  })
}

export const postMySectionEntry: RequestHandler = async (
  { params, body },
  response,
) => {
  const sectionId = params.sectionId

  const section = await prisma.section.findUnique({
    where: {
      id: sectionId,
    },
  })

  if (!section) {
    response.status(404).json({
      status: 'ERROR',
      message: ErrorCode['VAL-002'],
      error: 'VAL-002',
      data: {
        details: `Resource id: ${sectionId}`,
      },
    })
    return
  }

  const validatorEntryLocationObject = z.object({
    city: z.string().optional(),
    country: z.string().optional(),
  }) satisfies z.Schema<Prisma.EntryLocationUncheckedCreateInput>

  const validatorEntryStartDateObject = z.object({
    date: z.string().datetime().optional(),
    isVisible: z.boolean().optional(),
    isOnlyYear: z.boolean().optional(),
  }) satisfies z.Schema<Prisma.EntryStartDateUncheckedCreateInput>

  const validatorEntryEndDateObject = z.object({
    date: z.string().datetime().optional(),
    isCurrentDate: z.boolean().optional(),
    isVisible: z.boolean().optional(),
    isOnlyYear: z.boolean().optional(),
  }) satisfies z.Schema<Prisma.EntryEndDateUncheckedCreateInput>

  const validatorEntryDateObject = z.object({
    entryStartDate: validatorEntryStartDateObject,
    entryEndDate: validatorEntryEndDateObject,
  }) satisfies z.Schema<EntryDateUncheckedCreateInput>

  const entryType = section.entryType

  let validatorObject

  switch (entryType) {
    case 'SKILL': {
      validatorObject = z.object({
        isVisible: z.boolean().optional(),
        entryType: z.literal(entryType),
        name: z.string(),
        information: z.string().optional(),
        skillLevel: z.nativeEnum(SkillLevel).optional(),
      }) satisfies z.Schema<SkillEntryUncheckedCreateInput>

      break
    }
    case 'PROJECT': {
      validatorObject = z.object({
        isVisible: z.boolean().optional(),
        entryType: z.literal(entryType),
        linkId: z.string().cuid().optional(),
        title: z.string(),
        subTitle: z.string().optional(),
        description: z.string().optional(),
        entryDate: validatorEntryDateObject,
      }) satisfies z.Schema<ProjectEntryUncheckedCreateInput>

      break
    }
    case 'PROFESSIONAL_EXPERIENCE': {
      validatorObject = z.object({
        isVisible: z.boolean().optional(),
        entryType: z.literal(entryType),
        linkId: z.string().cuid().optional(),
        jobTitle: z.string().optional(),
        employer: z.string().optional(),
        description: z.string().optional(),
        entryLocation: validatorEntryLocationObject,
        entryDate: validatorEntryDateObject,
      }) satisfies z.Schema<ProfessionalExperienceEntryUncheckedCreateInput>

      break
    }
    case 'EDUCATION': {
      validatorObject = z.object({
        isVisible: z.boolean().optional(),
        entryType: z.literal(entryType),
        linkId: z.string().cuid().optional(),
        school: z.string().optional(),
        degree: z.string().optional(),
        description: z.string().optional(),
        entryLocation: validatorEntryLocationObject,
        entryDate: validatorEntryDateObject,
      }) satisfies z.Schema<EducationEntryUncheckedCreateInput>

      break
    }
    case 'COURSE': {
      validatorObject = z.object({
        isVisible: z.boolean().optional(),
        entryType: z.literal(entryType),
        linkId: z.string().cuid().optional(),
        title: z.string(),
        institution: z.string().optional(),
        description: z.string().optional(),
        entryLocation: validatorEntryLocationObject,
        entryDate: validatorEntryDateObject,
      }) satisfies z.Schema<CourseEntryUncheckedCreateInput>

      break
    }
    case 'CUSTOM': {
      validatorObject = z.object({
        isVisible: z.boolean().optional(),
        entryType: z.literal(entryType),
        linkId: z.string().cuid().optional(),
        title: z.string().optional(),
        subTitle: z.string().optional(),
        description: z.string().optional(),
        entryLocation: validatorEntryLocationObject,
        entryDate: validatorEntryDateObject,
      }) satisfies z.Schema<CustomEntryUncheckedCreateInput>

      break
    }
  }

  const validator = validatorObject.safeParse(body)

  if (!validator.success) {
    response.status(400).json({
      status: 'ERROR',
      message: ErrorCode['VAL-001'],
      error: 'VAL-001',
      data: {
        issues: validator.error.issues,
      },
    })

    return
  }

  let entryArgs: Prisma.EntryCreateArgs

  switch (entryType) {
    case 'SKILL': {
      const data = validator.data as SkillEntryUncheckedCreateInput

      entryArgs = {
        data: {
          sectionId,
          isVisible: data.isVisible,
          entryType: data.entryType,
          SkillEntry: {
            create: {
              name: data.name,
              information: data.information,
              skillLevel: data.skillLevel,
            },
          },
        },
        include: {
          SkillEntry: true,
        },
      }
      break
    }
    case 'PROJECT': {
      const data = validator.data as ProjectEntryUncheckedCreateInput

      entryArgs = {
        data: {
          sectionId,
          isVisible: data.isVisible,
          entryType: data.entryType,
          ProjectEntry: {
            create: {
              title: data.title,
              description: data.description,
              subtitle: data.subtitle,
              EntryDate: {
                create: {
                  EntryStartDate: {
                    create: {
                      date: data.entryDate.entryStartDate.date,
                      isOnlyYear: data.entryDate.entryStartDate.isOnlyYear,
                      isVisible: data.entryDate.entryStartDate.isVisible,
                    },
                  },
                  EntryEndDate: {
                    create: {
                      date: data.entryDate.entryEndDate.date,
                      isCurrentDate: data.entryDate.entryEndDate.isCurrentDate,
                      isOnlyYear: data.entryDate.entryEndDate.isOnlyYear,
                      isVisible: data.entryDate.entryEndDate.isVisible,
                    },
                  },
                },
              },
            },
          },
        },
        include: {
          ProjectEntry: {
            include: {
              EntryDate: true,
            },
          },
        },
      }

      if (data.linkId) {
        const link = await prisma.link.findUnique({
          where: {
            id: data.linkId,
          },
        })

        if (link)
          entryArgs.data.ProjectEntry!.create!.Link = {
            connect: {
              id: link.id,
            },
          }
      }

      break
    }
    case 'PROFESSIONAL_EXPERIENCE': {
      const data =
        validator.data as ProfessionalExperienceEntryUncheckedCreateInput

      entryArgs = {
        data: {
          sectionId,
          isVisible: data.isVisible,
          entryType: data.entryType,
          ProfessionalExperienceEntry: {
            create: {
              description: data.description,
              employer: data.employer,
              jobTitle: data.jobTitle,
              EntryDate: {
                create: {
                  EntryStartDate: {
                    create: {
                      date: data.entryDate.entryStartDate.date,
                      isOnlyYear: data.entryDate.entryStartDate.isOnlyYear,
                      isVisible: data.entryDate.entryStartDate.isVisible,
                    },
                  },
                  EntryEndDate: {
                    create: {
                      date: data.entryDate.entryEndDate.date,
                      isCurrentDate: data.entryDate.entryEndDate.isCurrentDate,
                      isOnlyYear: data.entryDate.entryEndDate.isOnlyYear,
                      isVisible: data.entryDate.entryEndDate.isVisible,
                    },
                  },
                },
              },
              EntryLocation: {
                create: {
                  city: data.entryLocation.city,
                  country: data.entryLocation.country,
                },
              },
            },
          },
        },
        include: {
          ProfessionalExperienceEntry: {
            include: {
              EntryLocation: true,
              EntryDate: {
                include: {
                  EntryStartDate: true,
                  EntryEndDate: true,
                },
              },
            },
          },
        },
      }

      if (data.linkId) {
        const link = await prisma.link.findUnique({
          where: {
            id: data.linkId,
          },
        })

        if (link)
          entryArgs.data.ProjectEntry!.create!.Link = {
            connect: {
              id: link.id,
            },
          }
      }
      break
    }
    case 'EDUCATION': {
      const data = validator.data as EducationEntryUncheckedCreateInput

      entryArgs = {
        data: {
          sectionId,
          entryType: data.entryType,
          isVisible: data.isVisible,
          EducationEntry: {
            create: {
              degree: data.degree,
              description: data.description,
              school: data.school,
              EntryLocation: {
                create: {
                  city: data.entryLocation.city,
                  country: data.entryLocation.country,
                },
              },
              EntryDate: {
                create: {
                  EntryStartDate: {
                    create: {
                      date: data.entryDate.entryStartDate.date,
                      isOnlyYear: data.entryDate.entryStartDate.isOnlyYear,
                      isVisible: data.entryDate.entryEndDate.isVisible,
                    },
                  },
                  EntryEndDate: {
                    create: {
                      date: data.entryDate.entryEndDate.date,
                      isCurrentDate: data.entryDate.entryEndDate.isCurrentDate,
                      isOnlyYear: data.entryDate.entryEndDate.isOnlyYear,
                      isVisible: data.entryDate.entryEndDate.isVisible,
                    },
                  },
                },
              },
            },
          },
        },
        include: {
          EducationEntry: {
            include: {
              EntryLocation: true,
              EntryDate: {
                include: {
                  EntryStartDate: true,
                  EntryEndDate: true,
                },
              },
            },
          },
        },
      }

      if (data.linkId) {
        const link = await prisma.link.findUnique({
          where: {
            id: data.linkId,
          },
        })

        if (link)
          entryArgs.data.ProjectEntry!.create!.Link = {
            connect: {
              id: link.id,
            },
          }
      }
      break
    }
    case 'COURSE': {
      const data = validator.data as CourseEntryUncheckedCreateInput

      entryArgs = {
        data: {
          sectionId,
          entryType: data.entryType,
          isVisible: data.isVisible,
          CourseEntry: {
            create: {
              title: data.title,
              description: data.description,
              institution: data.institution,
              EntryLocation: {
                create: {
                  city: data.entryLocation.city,
                  country: data.entryLocation.country,
                },
              },
              EntryDate: {
                create: {
                  EntryStartDate: {
                    create: {
                      date: data.entryDate.entryStartDate.date,
                      isOnlyYear: data.entryDate.entryStartDate.isOnlyYear,
                      isVisible: data.entryDate.entryEndDate.isVisible,
                    },
                  },
                  EntryEndDate: {
                    create: {
                      date: data.entryDate.entryEndDate.date,
                      isCurrentDate: data.entryDate.entryEndDate.isCurrentDate,
                      isOnlyYear: data.entryDate.entryEndDate.isOnlyYear,
                      isVisible: data.entryDate.entryEndDate.isVisible,
                    },
                  },
                },
              },
            },
          },
        },
        include: {
          CourseEntry: {
            include: {
              EntryLocation: true,
              EntryDate: {
                include: {
                  EntryStartDate: true,
                  EntryEndDate: true,
                },
              },
            },
          },
        },
      }

      if (data.linkId) {
        const link = await prisma.link.findUnique({
          where: {
            id: data.linkId,
          },
        })

        if (link)
          entryArgs.data.ProjectEntry!.create!.Link = {
            connect: {
              id: link.id,
            },
          }
      }
      break
    }
    case 'CUSTOM': {
      const data = validator.data as CustomEntryUncheckedCreateInput

      entryArgs = {
        data: {
          sectionId,
          entryType: data.entryType,
          isVisible: data.isVisible,
          CustomEntry: {
            create: {
              description: data.description,
              subtitle: data.subtitle,
              title: data.title,
              EntryLocation: {
                create: {
                  city: data.entryLocation.city,
                  country: data.entryLocation.country,
                },
              },
              EntryDate: {
                create: {
                  EntryStartDate: {
                    create: {
                      date: data.entryDate.entryStartDate.date,
                      isOnlyYear: data.entryDate.entryStartDate.isOnlyYear,
                      isVisible: data.entryDate.entryEndDate.isVisible,
                    },
                  },
                  EntryEndDate: {
                    create: {
                      date: data.entryDate.entryEndDate.date,
                      isCurrentDate: data.entryDate.entryEndDate.isCurrentDate,
                      isOnlyYear: data.entryDate.entryEndDate.isOnlyYear,
                      isVisible: data.entryDate.entryEndDate.isVisible,
                    },
                  },
                },
              },
            },
          },
        },
        include: {
          CustomEntry: {
            include: {
              EntryLocation: true,
              EntryDate: {
                include: {
                  EntryStartDate: true,
                  EntryEndDate: true,
                },
              },
            },
          },
        },
      }

      if (data.linkId) {
        const link = await prisma.link.findUnique({
          where: {
            id: data.linkId,
          },
        })

        if (link)
          entryArgs.data.ProjectEntry!.create!.Link = {
            connect: {
              id: link.id,
            },
          }
      }
      break
    }
  }

  const entry = await prisma.entry.create(entryArgs)

  const normalizedEntry = normalizeOutput(entry)

  response.json({
    status: 'SUCCESS',
    data: {
      entry: normalizedEntry,
    },
  })
}
