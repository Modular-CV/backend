-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('LEVEL_0', 'LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4');

-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "profileId" TEXT;

-- CreateTable
CREATE TABLE "ResumeSection" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "sectionOrder" INTEGER NOT NULL,

    CONSTRAINT "ResumeSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "jobTitle" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Link" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entry" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntryLocation" (
    "id" TEXT NOT NULL,
    "city" TEXT,
    "country" TEXT,

    CONSTRAINT "EntryLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntryStartDate" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isOnlyYear" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EntryStartDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntryEndDate" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "isCurrentDate" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isOnlyYear" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EntryEndDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntryDate" (
    "id" TEXT NOT NULL,
    "entryStartDateId" TEXT NOT NULL,
    "entryEndDateId" TEXT NOT NULL,

    CONSTRAINT "EntryDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationEntry" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "entryLocationId" TEXT NOT NULL,
    "entryDateId" TEXT NOT NULL,
    "linkId" TEXT,
    "school" TEXT,
    "degree" TEXT,
    "description" TEXT,

    CONSTRAINT "EducationEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfessionalExperienceEntry" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "entryLocationId" TEXT NOT NULL,
    "entryDateId" TEXT NOT NULL,
    "linkId" TEXT,
    "jobTitle" TEXT,
    "employer" TEXT,
    "description" TEXT,

    CONSTRAINT "ProfessionalExperienceEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectEntry" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "entryDateId" TEXT NOT NULL,
    "linkId" TEXT,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,

    CONSTRAINT "ProjectEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseEntry" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "entryLocationId" TEXT NOT NULL,
    "entryDateId" TEXT NOT NULL,
    "linkId" TEXT,
    "title" TEXT NOT NULL,
    "institution" TEXT,
    "description" TEXT,

    CONSTRAINT "CourseEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomEntry" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "entryLocationId" TEXT NOT NULL,
    "entryDateId" TEXT NOT NULL,
    "linkId" TEXT,
    "title" TEXT,
    "subtitle" TEXT,
    "description" TEXT,

    CONSTRAINT "CustomEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillEntry" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "information" TEXT,
    "skillLevel" "SkillLevel",

    CONSTRAINT "SkillEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResumeSection_resumeId_sectionOrder_key" ON "ResumeSection"("resumeId", "sectionOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Entry_sectionId_key" ON "Entry"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "EntryDate_entryStartDateId_key" ON "EntryDate"("entryStartDateId");

-- CreateIndex
CREATE UNIQUE INDEX "EntryDate_entryEndDateId_key" ON "EntryDate"("entryEndDateId");

-- CreateIndex
CREATE UNIQUE INDEX "EducationEntry_entryId_key" ON "EducationEntry"("entryId");

-- CreateIndex
CREATE UNIQUE INDEX "EducationEntry_entryLocationId_key" ON "EducationEntry"("entryLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "EducationEntry_entryDateId_key" ON "EducationEntry"("entryDateId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionalExperienceEntry_entryId_key" ON "ProfessionalExperienceEntry"("entryId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionalExperienceEntry_entryLocationId_key" ON "ProfessionalExperienceEntry"("entryLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionalExperienceEntry_entryDateId_key" ON "ProfessionalExperienceEntry"("entryDateId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectEntry_entryId_key" ON "ProjectEntry"("entryId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectEntry_entryDateId_key" ON "ProjectEntry"("entryDateId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseEntry_entryId_key" ON "CourseEntry"("entryId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseEntry_entryLocationId_key" ON "CourseEntry"("entryLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseEntry_entryDateId_key" ON "CourseEntry"("entryDateId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomEntry_entryId_key" ON "CustomEntry"("entryId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomEntry_entryLocationId_key" ON "CustomEntry"("entryLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomEntry_entryDateId_key" ON "CustomEntry"("entryDateId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillEntry_entryId_key" ON "SkillEntry"("entryId");

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeSection" ADD CONSTRAINT "ResumeSection_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeSection" ADD CONSTRAINT "ResumeSection_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntryDate" ADD CONSTRAINT "EntryDate_entryStartDateId_fkey" FOREIGN KEY ("entryStartDateId") REFERENCES "EntryStartDate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntryDate" ADD CONSTRAINT "EntryDate_entryEndDateId_fkey" FOREIGN KEY ("entryEndDateId") REFERENCES "EntryEndDate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationEntry" ADD CONSTRAINT "EducationEntry_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationEntry" ADD CONSTRAINT "EducationEntry_entryLocationId_fkey" FOREIGN KEY ("entryLocationId") REFERENCES "EntryLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationEntry" ADD CONSTRAINT "EducationEntry_entryDateId_fkey" FOREIGN KEY ("entryDateId") REFERENCES "EntryDate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationEntry" ADD CONSTRAINT "EducationEntry_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalExperienceEntry" ADD CONSTRAINT "ProfessionalExperienceEntry_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalExperienceEntry" ADD CONSTRAINT "ProfessionalExperienceEntry_entryLocationId_fkey" FOREIGN KEY ("entryLocationId") REFERENCES "EntryLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalExperienceEntry" ADD CONSTRAINT "ProfessionalExperienceEntry_entryDateId_fkey" FOREIGN KEY ("entryDateId") REFERENCES "EntryDate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalExperienceEntry" ADD CONSTRAINT "ProfessionalExperienceEntry_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectEntry" ADD CONSTRAINT "ProjectEntry_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectEntry" ADD CONSTRAINT "ProjectEntry_entryDateId_fkey" FOREIGN KEY ("entryDateId") REFERENCES "EntryDate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectEntry" ADD CONSTRAINT "ProjectEntry_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEntry" ADD CONSTRAINT "CourseEntry_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEntry" ADD CONSTRAINT "CourseEntry_entryLocationId_fkey" FOREIGN KEY ("entryLocationId") REFERENCES "EntryLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEntry" ADD CONSTRAINT "CourseEntry_entryDateId_fkey" FOREIGN KEY ("entryDateId") REFERENCES "EntryDate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEntry" ADD CONSTRAINT "CourseEntry_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomEntry" ADD CONSTRAINT "CustomEntry_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomEntry" ADD CONSTRAINT "CustomEntry_entryLocationId_fkey" FOREIGN KEY ("entryLocationId") REFERENCES "EntryLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomEntry" ADD CONSTRAINT "CustomEntry_entryDateId_fkey" FOREIGN KEY ("entryDateId") REFERENCES "EntryDate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomEntry" ADD CONSTRAINT "CustomEntry_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillEntry" ADD CONSTRAINT "SkillEntry_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
