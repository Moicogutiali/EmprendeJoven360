import { eq, and, inArray, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, phases, levels, modules, units, contents, evaluations, evaluationAnswers, userProgress, gamification, initialDiagnostics, adaptiveRoutes, chatbotInteractions, mentorAssignments } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ===== USER MANAGEMENT =====

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: any = {};

    const textFields = ["name", "email", "loginMethod"] as const;

    textFields.forEach(field => {
      if (user[field] !== undefined) {
        values[field] = user[field];
        updateSet[field] = user[field];
      }
    });

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users)
      .values(values)
      .onConflictDoUpdate({
        target: users.openId,
        set: updateSet,
      });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== PHASES =====

export async function getPhases() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(phases).orderBy(phases.order);
}

export async function getPhaseById(phaseId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(phases).where(eq(phases.id, phaseId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== LEVELS =====

export async function getLevelsByPhase(phaseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(levels).where(eq(levels.phaseId, phaseId)).orderBy(levels.order);
}

export async function getLevelById(levelId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(levels).where(eq(levels.id, levelId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== MODULES =====

export async function getModulesByLevel(levelId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(modules).where(eq(modules.levelId, levelId)).orderBy(modules.order);
}

export async function getModuleById(moduleId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(modules).where(eq(modules.id, moduleId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== UNITS =====

export async function getUnitsByModule(moduleId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(units).where(eq(units.moduleId, moduleId)).orderBy(units.order);
}

export async function getUnitById(unitId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(units).where(eq(units.id, unitId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== CONTENTS =====

export async function getContentByUnit(unitId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contents).where(eq(contents.unitId, unitId));
}

// ===== EVALUATIONS =====

export async function getEvaluationByUnit(unitId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(evaluations).where(eq(evaluations.unitId, unitId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getEvaluationAnswers(userId: number, evaluationId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(evaluationAnswers)
    .where(and(eq(evaluationAnswers.userId, userId), eq(evaluationAnswers.evaluationId, evaluationId)))
    .orderBy(desc(evaluationAnswers.createdAt))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== USER PROGRESS =====

export async function getUserProgress(userId: number, unitId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userProgress)
    .where(and(eq(userProgress.userId, userId), eq(userProgress.unitId, unitId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserProgressByLevel(userId: number, levelId: number) {
  const db = await getDb();
  if (!db) return [];

  const levelModules = await db.select().from(modules).where(eq(modules.levelId, levelId));
  const moduleIds = levelModules.map(m => m.id);

  if (moduleIds.length === 0) return [];

  const levelUnits = await db.select().from(units).where(inArray(units.moduleId, moduleIds));
  const unitIds = levelUnits.map(u => u.id);

  if (unitIds.length === 0) return [];

  return db.select().from(userProgress)
    .where(and(eq(userProgress.userId, userId), inArray(userProgress.unitId, unitIds)));
}

// ===== GAMIFICATION =====

export async function getGamificationByUser(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(gamification).where(eq(gamification.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== INITIAL DIAGNOSTICS =====

export async function getInitialDiagnosticByUser(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(initialDiagnostics)
    .where(eq(initialDiagnostics.userId, userId))
    .orderBy(desc(initialDiagnostics.createdAt))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== ADAPTIVE ROUTES =====

export async function getAdaptiveRouteByUser(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(adaptiveRoutes)
    .where(eq(adaptiveRoutes.userId, userId))
    .orderBy(desc(adaptiveRoutes.updatedAt))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== CHATBOT INTERACTIONS =====

export async function getChatbotInteractionByUserAndRole(userId: number, role: 'mentor' | 'asesor' | 'motivador') {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(chatbotInteractions)
    .where(and(eq(chatbotInteractions.userId, userId), eq(chatbotInteractions.role, role)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== MENTOR ASSIGNMENTS =====

export async function getMentorAssignments(mentorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(mentorAssignments)
    .where(and(eq(mentorAssignments.mentorId, mentorId), eq(mentorAssignments.active, true)));
}

export async function getStudentMentors(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(mentorAssignments)
    .where(and(eq(mentorAssignments.studentId, studentId), eq(mentorAssignments.active, true)));
}
