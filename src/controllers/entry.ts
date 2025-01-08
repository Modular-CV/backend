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

  const entryType = section.entryType

  const validatorEntryObject = z.object({
    isVisible: z.boolean().optional(),
    entryType: z.literal(entryType),
  }) satisfies z.Schema<EntryUncheckedCreateInput>

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

  let validatorObject

  switch (entryType) {
    case 'SKILL': {
      validatorObject = validatorEntryObject.extend({
        entryType: z.literal(entryType),
        skillEntry: z.object({
          name: z.string(),
          information: z.string().optional(),
          skillLevel: z.nativeEnum(SkillLevel).optional(),
        }),
      }) satisfies z.Schema<SkillEntryUncheckedCreateInput>

      break
    }
    case 'PROJECT': {
      validatorObject = validatorEntryObject.extend({
        entryType: z.literal(entryType),
        projectEntry: z.object({
          linkId: z.string().cuid().optional(),
          title: z.string(),
          subTitle: z.string().optional(),
          description: z.string().optional(),
          entryDate: validatorEntryDateObject,
        }),
      }) satisfies z.Schema<ProjectEntryUncheckedCreateInput>

      break
    }

    case 'PROFESSIONAL_EXPERIENCE': {
      validatorObject = validatorEntryObject.extend({
        entryType: z.literal(entryType),
        professionalExperienceEntry: z
          .object({
            linkId: z.string().cuid().optional(),
            jobTitle: z.string().optional(),
            employer: z.string().optional(),
            description: z.string().optional(),
            entryLocation: validatorEntryLocationObject,
            entryDate: validatorEntryDateObject,
          })
          .merge(validatorEntryEndDateObject),
      }) satisfies z.Schema<ProfessionalExperienceEntryUncheckedCreateInput>

      break
    }
    case 'EDUCATION': {
      validatorObject = validatorEntryObject.extend({
        entryType: z.literal(entryType),
        educationEntry: z.object({
          linkId: z.string().cuid().optional(),
          school: z.string().optional(),
          degree: z.string().optional(),
          description: z.string().optional(),
          entryLocation: validatorEntryLocationObject,
          entryDate: validatorEntryDateObject,
        }),
      }) satisfies z.Schema<EducationEntryUncheckedCreateInput>

      break
    }
    case 'COURSE': {
      validatorObject = validatorEntryObject.extend({
        entryType: z.literal(entryType),
        courseEntry: z.object({
          linkId: z.string().cuid().optional(),
          title: z.string(),
          institution: z.string().optional(),
          description: z.string().optional(),
          entryLocation: validatorEntryLocationObject,
          entryDate: validatorEntryDateObject,
        }),
      }) satisfies z.Schema<CourseEntryUncheckedCreateInput>

      break
    }
    case 'CUSTOM': {
      validatorObject = validatorEntryObject.extend({
        entryType: z.literal(entryType),
        customEntry: z.object({
          linkId: z.string().cuid().optional(),
          title: z.string().optional(),
          subTitle: z.string().optional(),
          description: z.string().optional(),
          entryLocation: validatorEntryLocationObject,
          entryDate: validatorEntryDateObject,
        }),
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

  /**
   * Returns the link id or null
   */
  const validateLinkId = async (id?: string | null): Promise<string | null> => {
    if (!id) return null

    const link = await prisma.link.findUnique({
      where: {
        id,
      },
    })

    return link ? link.id : null
  }

  let entryArgs: Prisma.EntryCreateArgs

  switch (entryType) {
    case 'SKILL': {
      const entry = validator.data as SkillEntryUncheckedCreateInput

      entryArgs = {
        data: {
          sectionId,
          isVisible: entry.isVisible,
          entryType: entry.entryType,
          SkillEntry: {
            create: {
              name: entry.skillEntry.name,
              information: entry.skillEntry.information,
              skillLevel: entry.skillEntry.skillLevel,
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
      const entry = validator.data as ProjectEntryUncheckedCreateInput

      entryArgs = {
        data: {
          sectionId,
          isVisible: entry.isVisible,
          entryType: entry.entryType,
          ProjectEntry: {
            create: {
              title: entry.projectEntry.title,
              description: entry.projectEntry.description,
              subtitle: entry.projectEntry.subtitle,
              EntryDate: {
                create: {
                  EntryStartDate: {
                    create: {
                      date: entry.projectEntry.entryDate.entryStartDate.date,
                      isOnlyYear:
                        entry.projectEntry.entryDate.entryStartDate.isOnlyYear,
                      isVisible:
                        entry.projectEntry.entryDate.entryStartDate.isVisible,
                    },
                  },
                  EntryEndDate: {
                    create: {
                      date: entry.projectEntry.entryDate.entryEndDate.date,
                      isCurrentDate:
                        entry.projectEntry.entryDate.entryEndDate.isCurrentDate,
                      isOnlyYear:
                        entry.projectEntry.entryDate.entryEndDate.isOnlyYear,
                      isVisible:
                        entry.projectEntry.entryDate.entryEndDate.isVisible,
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

      const linkId = await validateLinkId(entry.projectEntry.linkId)

      if (linkId) {
        entryArgs.data.ProjectEntry!.create!.Link = {
          connect: {
            id: linkId,
          },
        }
      }

      break
    }
    case 'PROFESSIONAL_EXPERIENCE': {
      const entry =
        validator.data as ProfessionalExperienceEntryUncheckedCreateInput

      entryArgs = {
        data: {
          sectionId,
          isVisible: entry.isVisible,
          entryType: entry.entryType,
          ProfessionalExperienceEntry: {
            create: {
              description: entry.professionalExperienceEntry.description,
              employer: entry.professionalExperienceEntry.employer,
              jobTitle: entry.professionalExperienceEntry.jobTitle,
              EntryDate: {
                create: {
                  EntryStartDate: {
                    create: {
                      date: entry.professionalExperienceEntry.entryDate
                        .entryStartDate.date,
                      isOnlyYear:
                        entry.professionalExperienceEntry.entryDate
                          .entryStartDate.isOnlyYear,
                      isVisible:
                        entry.professionalExperienceEntry.entryDate
                          .entryStartDate.isVisible,
                    },
                  },
                  EntryEndDate: {
                    create: {
                      date: entry.professionalExperienceEntry.entryDate
                        .entryEndDate.date,
                      isCurrentDate:
                        entry.professionalExperienceEntry.entryDate.entryEndDate
                          .isCurrentDate,
                      isOnlyYear:
                        entry.professionalExperienceEntry.entryDate.entryEndDate
                          .isOnlyYear,
                      isVisible:
                        entry.professionalExperienceEntry.entryDate.entryEndDate
                          .isVisible,
                    },
                  },
                },
              },
              EntryLocation: {
                create: {
                  city: entry.professionalExperienceEntry.entryLocation.city,
                  country:
                    entry.professionalExperienceEntry.entryLocation.country,
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

      const linkId = await validateLinkId(
        entry.professionalExperienceEntry.linkId,
      )

      if (linkId) {
        entryArgs.data.ProfessionalExperienceEntry!.create!.Link = {
          connect: {
            id: linkId,
          },
        }
      }
      break
    }
    case 'EDUCATION': {
      const entry = validator.data as EducationEntryUncheckedCreateInput

      entryArgs = {
        data: {
          sectionId,
          entryType: entry.entryType,
          isVisible: entry.isVisible,
          EducationEntry: {
            create: {
              degree: entry.educationEntry.degree,
              description: entry.educationEntry.description,
              school: entry.educationEntry.school,
              EntryLocation: {
                create: {
                  city: entry.educationEntry.entryLocation.city,
                  country: entry.educationEntry.entryLocation.country,
                },
              },
              EntryDate: {
                create: {
                  EntryStartDate: {
                    create: {
                      date: entry.educationEntry.entryDate.entryStartDate.date,
                      isOnlyYear:
                        entry.educationEntry.entryDate.entryStartDate
                          .isOnlyYear,
                      isVisible:
                        entry.educationEntry.entryDate.entryEndDate.isVisible,
                    },
                  },
                  EntryEndDate: {
                    create: {
                      date: entry.educationEntry.entryDate.entryEndDate.date,
                      isCurrentDate:
                        entry.educationEntry.entryDate.entryEndDate
                          .isCurrentDate,
                      isOnlyYear:
                        entry.educationEntry.entryDate.entryEndDate.isOnlyYear,
                      isVisible:
                        entry.educationEntry.entryDate.entryEndDate.isVisible,
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

      const linkId = await validateLinkId(entry.educationEntry.linkId)

      if (linkId) {
        entryArgs.data.EducationEntry!.create!.Link = {
          connect: {
            id: linkId,
          },
        }
      }
      break
    }
    case 'COURSE': {
      const entry = validator.data as CourseEntryUncheckedCreateInput

      entryArgs = {
        data: {
          sectionId,
          entryType: entry.entryType,
          isVisible: entry.isVisible,
          CourseEntry: {
            create: {
              title: entry.courseEntry.title,
              description: entry.courseEntry.description,
              institution: entry.courseEntry.institution,
              EntryLocation: {
                create: {
                  city: entry.courseEntry.entryLocation.city,
                  country: entry.courseEntry.entryLocation.country,
                },
              },
              EntryDate: {
                create: {
                  EntryStartDate: {
                    create: {
                      date: entry.courseEntry.entryDate.entryStartDate.date,
                      isOnlyYear:
                        entry.courseEntry.entryDate.entryStartDate.isOnlyYear,
                      isVisible:
                        entry.courseEntry.entryDate.entryEndDate.isVisible,
                    },
                  },
                  EntryEndDate: {
                    create: {
                      date: entry.courseEntry.entryDate.entryEndDate.date,
                      isCurrentDate:
                        entry.courseEntry.entryDate.entryEndDate.isCurrentDate,
                      isOnlyYear:
                        entry.courseEntry.entryDate.entryEndDate.isOnlyYear,
                      isVisible:
                        entry.courseEntry.entryDate.entryEndDate.isVisible,
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

      const linkId = await validateLinkId(entry.courseEntry.linkId)

      if (linkId) {
        entryArgs.data.CourseEntry!.create!.Link = {
          connect: {
            id: linkId,
          },
        }
      }
      break
    }
    case 'CUSTOM': {
      const entry = validator.data as CustomEntryUncheckedCreateInput

      entryArgs = {
        data: {
          sectionId,
          entryType: entry.entryType,
          isVisible: entry.isVisible,
          CustomEntry: {
            create: {
              description: entry.customEntry.description,
              subtitle: entry.customEntry.subtitle,
              title: entry.customEntry.title,
              EntryLocation: {
                create: {
                  city: entry.customEntry.entryLocation.city,
                  country: entry.customEntry.entryLocation.country,
                },
              },
              EntryDate: {
                create: {
                  EntryStartDate: {
                    create: {
                      date: entry.customEntry.entryDate.entryStartDate.date,
                      isOnlyYear:
                        entry.customEntry.entryDate.entryStartDate.isOnlyYear,
                      isVisible:
                        entry.customEntry.entryDate.entryEndDate.isVisible,
                    },
                  },
                  EntryEndDate: {
                    create: {
                      date: entry.customEntry.entryDate.entryEndDate.date,
                      isCurrentDate:
                        entry.customEntry.entryDate.entryEndDate.isCurrentDate,
                      isOnlyYear:
                        entry.customEntry.entryDate.entryEndDate.isOnlyYear,
                      isVisible:
                        entry.customEntry.entryDate.entryEndDate.isVisible,
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

      const linkId = await validateLinkId(entry.customEntry.linkId)

      if (linkId) {
        entryArgs.data.CustomEntry!.create!.Link = {
          connect: {
            id: linkId,
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
