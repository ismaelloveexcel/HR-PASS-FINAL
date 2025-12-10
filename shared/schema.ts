import { pgTable, serial, text, integer, boolean, timestamp, decimal, json, date, time, varchar } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("admin"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Managers table
export const managers = pgTable("managers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  jobTitle: text("job_title").notNull(),
  department: text("department").notNull(),
  canBeHiringManager: boolean("can_be_hiring_manager").default(true),
  canBeInterviewer: boolean("can_be_interviewer").default(true),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertManagerSchema = createInsertSchema(managers).omit({ id: true, createdAt: true });
export type InsertManager = z.infer<typeof insertManagerSchema>;
export type Manager = typeof managers.$inferSelect;

// Recruitment Passes
export const passes = pgTable("passes", {
  id: serial("id").primaryKey(),
  passId: text("pass_id").notNull().unique(),
  positionTitle: text("position_title").notNull(),
  department: text("department").notNull(),
  hiringManagerId: integer("hiring_manager_id").references(() => managers.id),
  headcount: integer("headcount").default(1),
  location: text("location").default("Abu Dhabi, UAE"),
  employmentType: text("employment_type").default("Full-time"),
  experienceMin: integer("experience_min"),
  experienceMax: integer("experience_max"),
  salaryRangeMin: integer("salary_range_min"),
  salaryRangeMax: integer("salary_range_max"),
  priority: text("priority").default("medium"),
  status: text("status").default("draft"),
  jobDescriptionDraft: text("job_description_draft"),
  jobDescriptionFinal: text("job_description_final"),
  jdStatus: text("jd_status").default("pending"),
  requisitionStatus: text("requisition_status").default("pending"),
  requisitionFilePath: text("requisition_file_path"),
  interviewFormat: text("interview_format"),
  interviewDuration: integer("interview_duration"),
  isPanelInterview: boolean("is_panel_interview").default(false),
  technicalAssessmentRequired: boolean("technical_assessment_required").default(false),
  technicalAssessmentAreas: text("technical_assessment_areas"),
  interviewSetupCompleted: boolean("interview_setup_completed").default(false),
  statusChangedAt: timestamp("status_changed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPassSchema = createInsertSchema(passes).omit({ id: true, createdAt: true, updatedAt: true, statusChangedAt: true });
export type InsertPass = z.infer<typeof insertPassSchema>;
export type Pass = typeof passes.$inferSelect;

// Candidates
export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  currentTitle: text("current_title"),
  currentCompany: text("current_company"),
  experienceYears: integer("experience_years"),
  currentLocation: text("current_location"),
  willingToRelocate: boolean("willing_to_relocate").default(true),
  noticePeriod: text("notice_period"),
  expectedSalary: integer("expected_salary"),
  visaStatus: text("visa_status"),
  source: text("source"),
  linkedinUrl: text("linkedin_url"),
  cvFilePath: text("cv_file_path"),
  passportCopyPath: text("passport_copy_path"),
  inTalentPool: boolean("in_talent_pool").default(false),
  talentPoolTags: json("talent_pool_tags"),
  talentPoolNotes: text("talent_pool_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCandidateSchema = createInsertSchema(candidates).omit({ id: true, createdAt: true });
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidates.$inferSelect;

// Pass-Candidate junction
export const passCandidates = pgTable("pass_candidates", {
  id: serial("id").primaryKey(),
  passId: integer("pass_id").references(() => passes.id).notNull(),
  candidateId: integer("candidate_id").references(() => candidates.id).notNull(),
  status: text("status").default("new"),
  aiRank: integer("ai_rank"),
  aiScore: integer("ai_score"),
  aiBrief: text("ai_brief"),
  softSkillsScore: decimal("soft_skills_score"),
  technicalScore: decimal("technical_score"),
  interviewScore: decimal("interview_score"),
  selectedForPosition: integer("selected_for_position"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPassCandidateSchema = createInsertSchema(passCandidates).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPassCandidate = z.infer<typeof insertPassCandidateSchema>;
export type PassCandidate = typeof passCandidates.$inferSelect;

// Panel Interviewers
export const panelInterviewers = pgTable("panel_interviewers", {
  id: serial("id").primaryKey(),
  passId: integer("pass_id").references(() => passes.id).notNull(),
  managerId: integer("manager_id").references(() => managers.id).notNull(),
});

// Interview Availability
export const interviewAvailability = pgTable("interview_availability", {
  id: serial("id").primaryKey(),
  passId: integer("pass_id").references(() => passes.id).notNull(),
  managerId: integer("manager_id").references(() => managers.id).notNull(),
  availableDate: date("available_date").notNull(),
  timeSlots: json("time_slots"),
});

// Interviews
export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  passCandidateId: integer("pass_candidate_id").references(() => passCandidates.id).notNull(),
  interviewDate: date("interview_date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time"),
  duration: integer("duration").default(60),
  format: text("format").default("face_to_face"),
  location: text("location"),
  meetingLink: text("meeting_link"),
  roundNumber: integer("round_number").default(1),
  status: text("status").default("scheduled"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInterviewSchema = createInsertSchema(interviews).omit({ id: true, createdAt: true });
export type InsertInterview = z.infer<typeof insertInterviewSchema>;
export type Interview = typeof interviews.$inferSelect;

// Interview Evaluations
export const interviewEvaluations = pgTable("interview_evaluations", {
  id: serial("id").primaryKey(),
  interviewId: integer("interview_id").references(() => interviews.id).notNull(),
  evaluatorId: integer("evaluator_id").references(() => managers.id).notNull(),
  educationalBackground: integer("educational_background"),
  priorWorkExperience: integer("prior_work_experience"),
  technicalSkills: integer("technical_skills"),
  personalityTeamFit: integer("personality_team_fit"),
  initiative: integer("initiative"),
  timeManagement: integer("time_management"),
  overallScore: decimal("overall_score"),
  notesObservations: text("notes_observations"),
  recommendation: text("recommendation"),
  finalComments: text("final_comments"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Technical Assessments
export const technicalAssessments = pgTable("technical_assessments", {
  id: serial("id").primaryKey(),
  passId: integer("pass_id").references(() => passes.id).notNull(),
  questions: json("questions"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Assessment Responses
export const assessmentResponses = pgTable("assessment_responses", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessment_id").references(() => technicalAssessments.id).notNull(),
  passCandidateId: integer("pass_candidate_id").references(() => passCandidates.id).notNull(),
  responses: json("responses"),
  score: decimal("score"),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

// Offers
export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  passCandidateId: integer("pass_candidate_id").references(() => passCandidates.id).notNull(),
  positionNumber: integer("position_number").default(1),
  salary: integer("salary").notNull(),
  benefits: json("benefits"),
  startDate: date("start_date"),
  probationMonths: integer("probation_months").default(6),
  noticeDays: integer("notice_days").default(30),
  status: text("status").default("draft"),
  approvedBy: integer("approved_by").references(() => managers.id),
  approvedAt: timestamp("approved_at"),
  sentAt: timestamp("sent_at"),
  respondedAt: timestamp("responded_at"),
  response: text("response"),
  negotiationNotes: text("negotiation_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOfferSchema = createInsertSchema(offers).omit({ id: true, createdAt: true });
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Offer = typeof offers.$inferSelect;

// Onboarding
export const onboarding = pgTable("onboarding", {
  id: serial("id").primaryKey(),
  passCandidateId: integer("pass_candidate_id").references(() => passCandidates.id).notNull(),
  offerId: integer("offer_id").references(() => offers.id),
  joiningDate: date("joining_date"),
  reportingTime: text("reporting_time"),
  reportingLocation: text("reporting_location"),
  securityClearanceStatus: text("security_clearance_status").default("pending"),
  visaStatusChange: text("visa_status_change").default("pending"),
  medicalStatus: text("medical_status").default("pending"),
  emiratesIdStatus: text("emirates_id_status").default("pending"),
  medicalInsuranceStatus: text("medical_insurance_status").default("pending"),
  contractSigningStatus: text("contract_signing_status").default("pending"),
  itSetupStatus: text("it_setup_status").default("pending"),
  orientationStatus: text("orientation_status").default("pending"),
  personalDetailsFormPath: text("personal_details_form_path"),
  bankDetailsFormPath: text("bank_details_form_path"),
  passportVisaCopyPath: text("passport_visa_copy_path"),
  photoPath: text("photo_path"),
  certificatesPath: text("certificates_path"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOnboardingSchema = createInsertSchema(onboarding).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOnboarding = z.infer<typeof insertOnboardingSchema>;
export type Onboarding = typeof onboarding.$inferSelect;

// Share Links
export const shareLinks = pgTable("share_links", {
  id: serial("id").primaryKey(),
  passId: integer("pass_id").references(() => passes.id).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at"),
  accessCount: integer("access_count").default(0),
  lastAccessedAt: timestamp("last_accessed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Candidate Links
export const candidateLinks = pgTable("candidate_links", {
  id: serial("id").primaryKey(),
  passCandidateId: integer("pass_candidate_id").references(() => passCandidates.id).notNull(),
  token: text("token").notNull().unique(),
  purpose: text("purpose"),
  expiresAt: timestamp("expires_at"),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Manager Feedback
export const managerFeedback = pgTable("manager_feedback", {
  id: serial("id").primaryKey(),
  passId: integer("pass_id").references(() => passes.id).notNull(),
  managerId: integer("manager_id").references(() => managers.id).notNull(),
  feedbackType: text("feedback_type").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Activity Log
export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  passId: integer("pass_id").references(() => passes.id),
  passCandidateId: integer("pass_candidate_id").references(() => passCandidates.id),
  actorType: text("actor_type").notNull(),
  actorId: integer("actor_id"),
  action: text("action").notNull(),
  details: json("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Documents
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  passId: integer("pass_id").references(() => passes.id),
  passCandidateId: integer("pass_candidate_id").references(() => passCandidates.id),
  documentType: text("document_type").notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  uploadedBy: text("uploaded_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Settings
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Conversations
export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  passId: integer("pass_id").references(() => passes.id),
  role: text("role").notNull(),
  content: text("content").notNull(),
  toolCalls: json("tool_calls"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const passesRelations = relations(passes, ({ one, many }) => ({
  hiringManager: one(managers, { fields: [passes.hiringManagerId], references: [managers.id] }),
  passCandidates: many(passCandidates),
  panelInterviewers: many(panelInterviewers),
  shareLinks: many(shareLinks),
}));

export const passCandidatesRelations = relations(passCandidates, ({ one, many }) => ({
  pass: one(passes, { fields: [passCandidates.passId], references: [passes.id] }),
  candidate: one(candidates, { fields: [passCandidates.candidateId], references: [candidates.id] }),
  interviews: many(interviews),
  offers: many(offers),
  onboarding: many(onboarding),
}));

export const interviewsRelations = relations(interviews, ({ one, many }) => ({
  passCandidate: one(passCandidates, { fields: [interviews.passCandidateId], references: [passCandidates.id] }),
  evaluations: many(interviewEvaluations),
}));

export const offersRelations = relations(offers, ({ one }) => ({
  passCandidate: one(passCandidates, { fields: [offers.passCandidateId], references: [passCandidates.id] }),
  approver: one(managers, { fields: [offers.approvedBy], references: [managers.id] }),
}));

export const onboardingRelations = relations(onboarding, ({ one }) => ({
  passCandidate: one(passCandidates, { fields: [onboarding.passCandidateId], references: [passCandidates.id] }),
  offer: one(offers, { fields: [onboarding.offerId], references: [offers.id] }),
}));
