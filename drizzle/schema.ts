import { integer, pgEnum, pgTable, text, timestamp, varchar, jsonb, decimal, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extended with profile data and role support for emprendedor, mentor, admin.
 */
export const roleEnum = pgEnum("role", ["emprendedor", "mentor", "admin"]);

export const users = pgTable("users", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("emprendedor").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  roleIdx: index("users_role_idx").on(table.role),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Fases de capacitación (Preincubación, Incubación)
export const phases = pgTable("phases", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Phase = typeof phases.$inferSelect;
export type InsertPhase = typeof phases.$inferInsert;

// Niveles (Explorador, Constructor, Estratega, Líder, Visionario)
export const levels = pgTable("levels", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  phaseId: integer("phaseId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  requirements: jsonb("requirements").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  phaseIdx: index("levels_phase_idx").on(table.phaseId),
}));

export type Level = typeof levels.$inferSelect;
export type InsertLevel = typeof levels.$inferInsert;

// Módulos (2 por nivel)
export const modules = pgTable("modules", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  levelId: integer("levelId").notNull(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  learningObjectives: jsonb("learningObjectives").$type<string[]>().default([]),
  estimatedHours: decimal("estimatedHours", { precision: 5, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  levelIdx: index("modules_level_idx").on(table.levelId),
}));

export type Module = typeof modules.$inferSelect;
export type InsertModule = typeof modules.$inferInsert;

export const contentTypeEnum = pgEnum("content_type", ["video", "podcast", "ebook", "infografia", "quiz"]);

// Unidades (3 por módulo, 30 totales)
export const units = pgTable("units", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  moduleId: integer("moduleId").notNull(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  contentType: contentTypeEnum("contentType").notNull(),
  contentUrl: text("contentUrl"),
  duration: integer("duration"),
  estimatedTime: integer("estimatedTime"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  moduleIdx: index("units_module_idx").on(table.moduleId),
}));

export type Unit = typeof units.$inferSelect;
export type InsertUnit = typeof units.$inferInsert;

// Contenidos detallados
export const contents = pgTable("contents", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  unitId: integer("unitId").notNull(),
  type: contentTypeEnum("type").notNull(),
  data: jsonb("data").$type<Record<string, unknown>>().notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  unitIdx: index("contents_unit_idx").on(table.unitId),
}));

export type Content = typeof contents.$inferSelect;
export type InsertContent = typeof contents.$inferInsert;

// Evaluaciones
export const evaluations = pgTable("evaluations", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  unitId: integer("unitId").notNull(),
  questions: jsonb("questions").$type<Array<Record<string, unknown>>>().notNull(),
  passingScore: integer("passingScore").default(70).notNull(),
  timeLimit: integer("timeLimit"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  unitIdx: index("evaluations_unit_idx").on(table.unitId),
}));

export type Evaluation = typeof evaluations.$inferSelect;
export type InsertEvaluation = typeof evaluations.$inferInsert;

// Respuestas de usuario a evaluaciones
export const evaluationAnswers = pgTable("evaluation_answers", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: integer("userId").notNull(),
  evaluationId: integer("evaluationId").notNull(),
  answers: jsonb("answers").$type<Record<string, unknown>>().notNull(),
  score: integer("score"),
  passed: boolean("passed").default(false),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("evaluation_answers_user_idx").on(table.userId),
  evaluationIdx: index("evaluation_answers_evaluation_idx").on(table.evaluationId),
}));

export type EvaluationAnswer = typeof evaluationAnswers.$inferSelect;
export type InsertEvaluationAnswer = typeof evaluationAnswers.$inferInsert;

export const progressStatusEnum = pgEnum("progress_status", ["no_iniciado", "en_progreso", "completado"]);

// Progreso del usuario
export const userProgress = pgTable("user_progress", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: integer("userId").notNull(),
  unitId: integer("unitId").notNull(),
  status: progressStatusEnum("status").default("no_iniciado").notNull(),
  percentageComplete: integer("percentageComplete").default(0),
  lastAccessedAt: timestamp("lastAccessedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_progress_user_idx").on(table.userId),
  unitIdx: index("user_progress_unit_idx").on(table.unitId),
}));

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;

// Gamificación
export const gamification = pgTable("gamification", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: integer("userId").notNull().unique(),
  totalPoints: integer("totalPoints").default(0),
  badges: jsonb("badges").$type<Array<{ id: string; name: string; unlockedAt: string }>>().default([]),
  currentLevel: integer("currentLevel").default(1),
  streak: integer("streak").default(0),
  lastActivityDate: timestamp("lastActivityDate"),
  achievements: jsonb("achievements").$type<Array<Record<string, unknown>>>().default([]),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("gamification_user_idx").on(table.userId),
}));

export type Gamification = typeof gamification.$inferSelect;
export type InsertGamification = typeof gamification.$inferInsert;

// Diagnóstico inicial
export const initialDiagnostics = pgTable("initial_diagnostics", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: integer("userId").notNull(),
  responses: jsonb("responses").$type<Record<string, unknown>>().notNull(),
  resultLevel: integer("resultLevel"),
  adaptiveRouteId: integer("adaptiveRouteId"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("initial_diagnostics_user_idx").on(table.userId),
}));

export type InitialDiagnostic = typeof initialDiagnostics.$inferSelect;
export type InsertInitialDiagnostic = typeof initialDiagnostics.$inferInsert;

// Rutas adaptativas
export const adaptiveRoutes = pgTable("adaptive_routes", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: integer("userId").notNull(),
  recommendedPath: jsonb("recommendedPath").$type<Array<Record<string, unknown>>>().notNull(),
  nextUnitId: integer("nextUnitId"),
  reasoning: text("reasoning"),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("adaptive_routes_user_idx").on(table.userId),
}));

export type AdaptiveRoute = typeof adaptiveRoutes.$inferSelect;
export type InsertAdaptiveRoute = typeof adaptiveRoutes.$inferInsert;

export const chatbotRoleEnum = pgEnum("chatbot_role", ["mentor", "asesor", "motivador"]);

// Interacciones del chatbot
export const chatbotInteractions = pgTable("chatbot_interactions", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: integer("userId").notNull(),
  role: chatbotRoleEnum("role").notNull(),
  messages: jsonb("messages").$type<Array<{ role: string; content: string; timestamp: string }>>().default([]),
  context: jsonb("context").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("chatbot_interactions_user_idx").on(table.userId),
}));

export type ChatbotInteraction = typeof chatbotInteractions.$inferSelect;
export type InsertChatbotInteraction = typeof chatbotInteractions.$inferInsert;

// Asignaciones de mentores
export const mentorAssignments = pgTable("mentor_assignments", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  mentorId: integer("mentorId").notNull(),
  studentId: integer("studentId").notNull(),
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
  notes: text("notes"),
  active: boolean("active").default(true),
}, (table) => ({
  mentorIdx: index("mentor_idx").on(table.mentorId),
  studentIdx: index("student_idx").on(table.studentId),
}));

export type MentorAssignment = typeof mentorAssignments.$inferSelect;
export type InsertMentorAssignment = typeof mentorAssignments.$inferInsert;