var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// drizzle/schema.ts
import { integer, pgEnum, pgTable, text, timestamp, varchar, jsonb, decimal, boolean, index } from "drizzle-orm/pg-core";
var roleEnum, users, phases, levels, modules, contentTypeEnum, units, contents, evaluations, evaluationAnswers, progressStatusEnum, userProgress, gamification, initialDiagnostics, adaptiveRoutes, chatbotRoleEnum, chatbotInteractions, mentorAssignments;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    roleEnum = pgEnum("role", ["emprendedor", "mentor", "admin"]);
    users = pgTable("users", {
      id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
      openId: varchar("openId", { length: 64 }).notNull().unique(),
      name: text("name"),
      email: varchar("email", { length: 320 }),
      loginMethod: varchar("loginMethod", { length: 64 }),
      role: roleEnum("role").default("emprendedor").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull(),
      lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
    }, (table) => ({
      roleIdx: index("users_role_idx").on(table.role)
    }));
    phases = pgTable("phases", {
      id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
      name: varchar("name", { length: 100 }).notNull(),
      description: text("description"),
      order: integer("order").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    levels = pgTable("levels", {
      id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
      phaseId: integer("phaseId").notNull(),
      name: varchar("name", { length: 100 }).notNull(),
      description: text("description"),
      order: integer("order").notNull(),
      requirements: jsonb("requirements").$type().default({}),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    }, (table) => ({
      phaseIdx: index("levels_phase_idx").on(table.phaseId)
    }));
    modules = pgTable("modules", {
      id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
      levelId: integer("levelId").notNull(),
      name: varchar("name", { length: 150 }).notNull(),
      description: text("description"),
      order: integer("order").notNull(),
      learningObjectives: jsonb("learningObjectives").$type().default([]),
      estimatedHours: decimal("estimatedHours", { precision: 5, scale: 2 }),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    }, (table) => ({
      levelIdx: index("modules_level_idx").on(table.levelId)
    }));
    contentTypeEnum = pgEnum("content_type", ["video", "podcast", "ebook", "infografia", "quiz"]);
    units = pgTable("units", {
      id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
      moduleId: integer("moduleId").notNull(),
      name: varchar("name", { length: 150 }).notNull(),
      description: text("description"),
      order: integer("order").notNull(),
      contentType: contentTypeEnum("contentType").notNull(),
      contentUrl: text("contentUrl"),
      duration: integer("duration"),
      estimatedTime: integer("estimatedTime"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    }, (table) => ({
      moduleIdx: index("units_module_idx").on(table.moduleId)
    }));
    contents = pgTable("contents", {
      id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
      unitId: integer("unitId").notNull(),
      type: contentTypeEnum("type").notNull(),
      data: jsonb("data").$type().notNull(),
      createdBy: integer("createdBy").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    }, (table) => ({
      unitIdx: index("contents_unit_idx").on(table.unitId)
    }));
    evaluations = pgTable("evaluations", {
      id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
      unitId: integer("unitId").notNull(),
      questions: jsonb("questions").$type().notNull(),
      passingScore: integer("passingScore").default(70).notNull(),
      timeLimit: integer("timeLimit"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    }, (table) => ({
      unitIdx: index("evaluations_unit_idx").on(table.unitId)
    }));
    evaluationAnswers = pgTable("evaluation_answers", {
      id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
      userId: integer("userId").notNull(),
      evaluationId: integer("evaluationId").notNull(),
      answers: jsonb("answers").$type().notNull(),
      score: integer("score"),
      passed: boolean("passed").default(false),
      completedAt: timestamp("completedAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    }, (table) => ({
      userIdx: index("evaluation_answers_user_idx").on(table.userId),
      evaluationIdx: index("evaluation_answers_evaluation_idx").on(table.evaluationId)
    }));
    progressStatusEnum = pgEnum("progress_status", ["no_iniciado", "en_progreso", "completado"]);
    userProgress = pgTable("user_progress", {
      id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
      userId: integer("userId").notNull(),
      unitId: integer("unitId").notNull(),
      status: progressStatusEnum("status").default("no_iniciado").notNull(),
      percentageComplete: integer("percentageComplete").default(0),
      lastAccessedAt: timestamp("lastAccessedAt"),
      completedAt: timestamp("completedAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    }, (table) => ({
      userIdx: index("user_progress_user_idx").on(table.userId),
      unitIdx: index("user_progress_unit_idx").on(table.unitId)
    }));
    gamification = pgTable("gamification", {
      id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
      userId: integer("userId").notNull().unique(),
      totalPoints: integer("totalPoints").default(0),
      badges: jsonb("badges").$type().default([]),
      currentLevel: integer("currentLevel").default(1),
      streak: integer("streak").default(0),
      lastActivityDate: timestamp("lastActivityDate"),
      achievements: jsonb("achievements").$type().default([]),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    }, (table) => ({
      userIdx: index("gamification_user_idx").on(table.userId)
    }));
    initialDiagnostics = pgTable("initial_diagnostics", {
      id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
      userId: integer("userId").notNull(),
      responses: jsonb("responses").$type().notNull(),
      resultLevel: integer("resultLevel"),
      adaptiveRouteId: integer("adaptiveRouteId"),
      completedAt: timestamp("completedAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    }, (table) => ({
      userIdx: index("initial_diagnostics_user_idx").on(table.userId)
    }));
    adaptiveRoutes = pgTable("adaptive_routes", {
      id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
      userId: integer("userId").notNull(),
      recommendedPath: jsonb("recommendedPath").$type().notNull(),
      nextUnitId: integer("nextUnitId"),
      reasoning: text("reasoning"),
      generatedAt: timestamp("generatedAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    }, (table) => ({
      userIdx: index("adaptive_routes_user_idx").on(table.userId)
    }));
    chatbotRoleEnum = pgEnum("chatbot_role", ["mentor", "asesor", "motivador"]);
    chatbotInteractions = pgTable("chatbot_interactions", {
      id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
      userId: integer("userId").notNull(),
      role: chatbotRoleEnum("role").notNull(),
      messages: jsonb("messages").$type().default([]),
      context: jsonb("context").$type().default({}),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    }, (table) => ({
      userIdx: index("chatbot_interactions_user_idx").on(table.userId)
    }));
    mentorAssignments = pgTable("mentor_assignments", {
      id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
      mentorId: integer("mentorId").notNull(),
      studentId: integer("studentId").notNull(),
      assignedAt: timestamp("assignedAt").defaultNow().notNull(),
      notes: text("notes"),
      active: boolean("active").default(true)
    }, (table) => ({
      mentorIdx: index("mentor_idx").on(table.mentorId),
      studentIdx: index("student_idx").on(table.studentId)
    }));
  }
});

// _server/_core/env.ts
var ENV;
var init_env = __esm({
  "_server/_core/env.ts"() {
    "use strict";
    ENV = {
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
    };
  }
});

// _server/db.ts
var db_exports = {};
__export(db_exports, {
  getAdaptiveRouteByUser: () => getAdaptiveRouteByUser,
  getChatbotInteractionByUserAndRole: () => getChatbotInteractionByUserAndRole,
  getContentByUnit: () => getContentByUnit,
  getDb: () => getDb,
  getEvaluationAnswers: () => getEvaluationAnswers,
  getEvaluationByUnit: () => getEvaluationByUnit,
  getGamificationByUser: () => getGamificationByUser,
  getInitialDiagnosticByUser: () => getInitialDiagnosticByUser,
  getLevelById: () => getLevelById,
  getLevelsByPhase: () => getLevelsByPhase,
  getMentorAssignments: () => getMentorAssignments,
  getModuleById: () => getModuleById,
  getModulesByLevel: () => getModulesByLevel,
  getPhaseById: () => getPhaseById,
  getPhases: () => getPhases,
  getPhasesWithLevels: () => getPhasesWithLevels,
  getStudentMentors: () => getStudentMentors,
  getUnitById: () => getUnitById,
  getUnitsByModule: () => getUnitsByModule,
  getUserById: () => getUserById,
  getUserByOpenId: () => getUserByOpenId,
  getUserProgress: () => getUserProgress,
  getUserProgressByLevel: () => getUserProgressByLevel,
  upsertUser: () => upsertUser
});
import { eq, and, inArray, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL, {
        prepare: false,
        ssl: "require"
      });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    textFields.forEach((field) => {
      if (user[field] !== void 0) {
        values[field] = user[field];
        updateSet[field] = user[field];
      }
    });
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getUserById(userId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getPhases() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(phases).orderBy(phases.order);
}
async function getPhaseById(phaseId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(phases).where(eq(phases.id, phaseId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getPhasesWithLevels() {
  const db = await getDb();
  if (!db) return [];
  const phasesData = await db.select().from(phases).orderBy(phases.order);
  const levelsData = await db.select().from(levels).orderBy(levels.order);
  return phasesData.map((p) => ({
    ...p,
    levels: levelsData.filter((l) => l.phaseId === p.id)
  }));
}
async function getLevelsByPhase(phaseId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(levels).where(eq(levels.phaseId, phaseId)).orderBy(levels.order);
}
async function getLevelById(levelId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(levels).where(eq(levels.id, levelId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getModulesByLevel(levelId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(modules).where(eq(modules.levelId, levelId)).orderBy(modules.order);
}
async function getModuleById(moduleId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(modules).where(eq(modules.id, moduleId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getUnitsByModule(moduleId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(units).where(eq(units.moduleId, moduleId)).orderBy(units.order);
}
async function getUnitById(unitId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(units).where(eq(units.id, unitId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getContentByUnit(unitId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contents).where(eq(contents.unitId, unitId));
}
async function getEvaluationByUnit(unitId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(evaluations).where(eq(evaluations.unitId, unitId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getEvaluationAnswers(userId, evaluationId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(evaluationAnswers).where(and(eq(evaluationAnswers.userId, userId), eq(evaluationAnswers.evaluationId, evaluationId))).orderBy(desc(evaluationAnswers.createdAt)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getUserProgress(userId, unitId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(userProgress).where(and(eq(userProgress.userId, userId), eq(userProgress.unitId, unitId))).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getUserProgressByLevel(userId, levelId) {
  const db = await getDb();
  if (!db) return [];
  const levelModules = await db.select().from(modules).where(eq(modules.levelId, levelId));
  const moduleIds = levelModules.map((m) => m.id);
  if (moduleIds.length === 0) return [];
  const levelUnits = await db.select().from(units).where(inArray(units.moduleId, moduleIds));
  const unitIds = levelUnits.map((u) => u.id);
  if (unitIds.length === 0) return [];
  return db.select().from(userProgress).where(and(eq(userProgress.userId, userId), inArray(userProgress.unitId, unitIds)));
}
async function getGamificationByUser(userId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(gamification).where(eq(gamification.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getInitialDiagnosticByUser(userId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(initialDiagnostics).where(eq(initialDiagnostics.userId, userId)).orderBy(desc(initialDiagnostics.createdAt)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getAdaptiveRouteByUser(userId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(adaptiveRoutes).where(eq(adaptiveRoutes.userId, userId)).orderBy(desc(adaptiveRoutes.updatedAt)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getChatbotInteractionByUserAndRole(userId, role) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(chatbotInteractions).where(and(eq(chatbotInteractions.userId, userId), eq(chatbotInteractions.role, role))).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getMentorAssignments(mentorId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(mentorAssignments).where(and(eq(mentorAssignments.mentorId, mentorId), eq(mentorAssignments.active, true)));
}
async function getStudentMentors(studentId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(mentorAssignments).where(and(eq(mentorAssignments.studentId, studentId), eq(mentorAssignments.active, true)));
}
var _db;
var init_db = __esm({
  "_server/db.ts"() {
    "use strict";
    init_schema();
    init_env();
    _db = null;
  }
});

// vite.config.ts
var vite_config_exports = {};
__export(vite_config_exports, {
  default: () => vite_config_default
});
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var plugins, vite_config_default;
var init_vite_config = __esm({
  "vite.config.ts"() {
    "use strict";
    plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];
    vite_config_default = defineConfig({
      plugins,
      resolve: {
        alias: {
          "@": path.resolve(import.meta.dirname, "client", "src"),
          "@shared": path.resolve(import.meta.dirname, "shared"),
          "@assets": path.resolve(import.meta.dirname, "attached_assets")
        }
      },
      envDir: path.resolve(import.meta.dirname),
      root: path.resolve(import.meta.dirname, "client"),
      publicDir: path.resolve(import.meta.dirname, "client", "public"),
      build: {
        outDir: path.resolve(import.meta.dirname, "dist/public"),
        emptyOutDir: true
      },
      server: {
        host: true,
        allowedHosts: [
          ".manuspre.computer",
          ".manus.computer",
          ".manus-asia.computer",
          ".manuscomputer.ai",
          ".manusvm.computer",
          "localhost",
          "127.0.0.1"
        ],
        fs: {
          strict: true,
          deny: ["**/.*"]
        }
      }
    });
  }
});

// _server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// _server/_core/oauth.ts
init_db();
import { SignJWT as SignJWT2 } from "jose";

// _server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// _server/_core/sdk.ts
init_db();
init_env();
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    if (sessionUserId.startsWith("bypass-")) {
      return {
        id: 999999,
        openId: sessionUserId,
        name: session.name || "Usuario de Emergencia",
        email: "emergency@bypass.local",
        role: "admin",
        // Admin privileges for emergency access
        loginMethod: "bypass",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        lastSignedIn: /* @__PURE__ */ new Date()
      };
    }
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// _server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app2) {
  app2.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
  app2.get("/api/oauth/bypass", async (req, res) => {
    try {
      console.log("[Bypass] Starting Pure Mock sequence...");
      const ONE_YEAR_MS2 = 31536e6;
      const fakeUser = {
        openId: "bypass-admin-001",
        // Must start with 'bypass-' to trigger SDK mock logic
        name: "Admin Local",
        email: "admin@emprendejoven.dev"
      };
      const secret = process.env.JWT_SECRET || "super-secret-lms-key-2026";
      const secretKey = new TextEncoder().encode(secret);
      const sessionToken = await new SignJWT2({
        openId: fakeUser.openId,
        appId: "emprendejoven-360",
        name: fakeUser.name
      }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(Math.floor((Date.now() + ONE_YEAR_MS2) / 1e3)).sign(secretKey);
      console.log("[Bypass] Manual JWT created.");
      const isProduction = process.env.NODE_ENV === "production";
      res.cookie(COOKIE_NAME, sessionToken, {
        path: "/",
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: ONE_YEAR_MS2
      });
      console.log("[Bypass] Redirecting...");
      res.redirect(302, "/");
    } catch (error) {
      console.error("[Auth] Bypass CRITICAL FAILURE", error);
      res.status(500).json({
        error: "Bypass Critical Failure",
        message: String(error),
        stack: error.stack
      });
    }
  });
}

// _server/_core/systemRouter.ts
import { z } from "zod";

// _server/_core/notification.ts
init_env();
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// _server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// _server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// _server/routers.ts
init_db();
init_schema();
init_db();
import { TRPCError as TRPCError3 } from "@trpc/server";
import { z as z2 } from "zod";
var adminProcedure2 = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError3({ code: "FORBIDDEN", message: "Solo administradores pueden acceder" });
  }
  return next({ ctx });
});
var mentorProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "mentor" && ctx.user?.role !== "admin") {
    throw new TRPCError3({ code: "FORBIDDEN", message: "Solo mentores pueden acceder" });
  }
  return next({ ctx });
});
var appRouter = router({
  system: systemRouter,
  // ===== AUTENTICACIÓN Y USUARIOS =====
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
    updateProfile: protectedProcedure.input(z2.object({
      name: z2.string().optional(),
      email: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const { eq: eq2 } = __require("drizzle-orm");
      await db.update(users).set({
        name: input.name ?? void 0,
        email: input.email ?? void 0,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(users.id, ctx.user.id));
      return { success: true };
    })
  }),
  // ===== ESTRUCTURA DE APRENDIZAJE =====
  learning: router({
    // Obtener todas las fases
    getPhases: publicProcedure.query(async () => {
      return getPhases();
    }),
    // Obtener estructura completa (Fases + Niveles)
    getStructure: publicProcedure.query(async () => {
      const { getPhasesWithLevels: getPhasesWithLevels2 } = (init_db(), __toCommonJS(db_exports));
      return getPhasesWithLevels2();
    }),
    // Obtener niveles de una fase
    // Obtener niveles de una fase
    getLevelsByPhase: publicProcedure.input(z2.object({ phaseId: z2.number() })).query(async ({ input }) => {
      return getLevelsByPhase(input.phaseId);
    }),
    // Obtener módulos de un nivel
    getModulesByLevel: publicProcedure.input(z2.object({ levelId: z2.number() })).query(async ({ input }) => {
      return getModulesByLevel(input.levelId);
    }),
    // Obtener unidades de un módulo
    getUnitsByModule: publicProcedure.input(z2.object({ moduleId: z2.number() })).query(async ({ input }) => {
      return getUnitsByModule(input.moduleId);
    }),
    // Obtener detalles de una unidad
    getUnitDetails: publicProcedure.input(z2.object({ unitId: z2.number() })).query(async ({ input }) => {
      return getUnitById(input.unitId);
    })
  }),
  // ===== PROGRESO Y GAMIFICACIÓN =====
  progress: router({
    // Obtener gamificación del usuario
    getGamification: protectedProcedure.query(async ({ ctx }) => {
      let gamif = await getGamificationByUser(ctx.user.id);
      if (!gamif) {
        const db = await getDb();
        if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        await db.insert(gamification).values({
          userId: ctx.user.id,
          totalPoints: 0,
          currentLevel: 1,
          streak: 0,
          badges: [],
          achievements: []
        });
        gamif = await getGamificationByUser(ctx.user.id);
      }
      return gamif;
    }),
    // Actualizar puntos del usuario
    addPoints: protectedProcedure.input(z2.object({ points: z2.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const current = await getGamificationByUser(ctx.user.id);
      if (!current) throw new TRPCError3({ code: "NOT_FOUND", message: "Gamification not found" });
      const newPoints = (current.totalPoints || 0) + input.points;
      const newLevel = Math.floor(newPoints / 1e3) + 1;
      const { eq: eq2 } = __require("drizzle-orm");
      await db.update(gamification).set({
        totalPoints: newPoints,
        currentLevel: newLevel,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(gamification.userId, ctx.user.id));
      return { success: true, totalPoints: newPoints, currentLevel: newLevel };
    })
  }),
  // ===== DIAGNÓSTICO INICIAL =====
  diagnostic: router({
    // Obtener diagnóstico del usuario
    getDiagnostic: protectedProcedure.query(async ({ ctx }) => {
      return getInitialDiagnosticByUser(ctx.user.id);
    }),
    // Guardar respuestas del diagnóstico
    saveDiagnostic: protectedProcedure.input(z2.object({
      responses: z2.record(z2.string(), z2.unknown()),
      resultLevel: z2.number().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      await db.insert(initialDiagnostics).values({
        userId: ctx.user.id,
        responses: input.responses,
        resultLevel: input.resultLevel,
        completedAt: /* @__PURE__ */ new Date()
      });
      return { success: true };
    })
  }),
  // ===== RUTAS ADAPTATIVAS =====
  adaptiveRoute: router({
    // Obtener ruta adaptativa del usuario
    getRoute: protectedProcedure.query(async ({ ctx }) => {
      return getAdaptiveRouteByUser(ctx.user.id);
    })
  }),
  // ===== CHATBOT =====
  chatbot: router({
    // Obtener conversación del chatbot
    getConversation: protectedProcedure.input(z2.object({ role: z2.enum(["mentor", "asesor", "motivador"]) })).query(async ({ ctx, input }) => {
      return getChatbotInteractionByUserAndRole(ctx.user.id, input.role);
    }),
    // Enviar mensaje al chatbot
    sendMessage: protectedProcedure.input(z2.object({
      role: z2.enum(["mentor", "asesor", "motivador"]),
      message: z2.string()
    })).mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "Mensaje recibido"
      };
    })
  }),
  // ===== MENTORÍA =====
  mentorship: router({
    // Obtener mentores del estudiante
    getMyMentors: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "emprendedor") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Solo emprendedores pueden tener mentores" });
      }
      return getStudentMentors(ctx.user.id);
    })
  }),
  // ===== ADMINISTRACIÓN =====
  admin: router({
    // Obtener todos los usuarios
    getUsers: adminProcedure2.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      return db.select().from(users);
    }),
    // Actualizar rol de usuario
    updateUserRole: adminProcedure2.input(z2.object({
      userId: z2.number(),
      role: z2.enum(["emprendedor", "mentor", "admin"])
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const { eq: eq2 } = __require("drizzle-orm");
      await db.update(users).set({ role: input.role, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(users.id, input.userId));
      return { success: true };
    }),
    // Asignar mentor a estudiante
    assignMentor: adminProcedure2.input(z2.object({
      mentorId: z2.number(),
      studentId: z2.number(),
      notes: z2.string().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      await db.insert(mentorAssignments).values({
        mentorId: input.mentorId,
        studentId: input.studentId,
        notes: input.notes ?? void 0,
        active: true
      });
      return { success: true };
    }),
    // ===== GESTIÓN DE CONTENIDO (ADMIN) =====
    learning: router({
      // --- FASES ---
      createPhase: adminProcedure2.input(z2.object({
        name: z2.string().min(1),
        description: z2.string().optional(),
        order: z2.number().int()
      })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB error" });
        await db.insert(phases).values(input);
        return { success: true };
      }),
      updatePhase: adminProcedure2.input(z2.object({
        id: z2.number(),
        name: z2.string().optional(),
        description: z2.string().optional(),
        order: z2.number().optional()
      })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB error" });
        const { eq: eq2 } = __require("drizzle-orm");
        await db.update(phases).set(input).where(eq2(phases.id, input.id));
        return { success: true };
      }),
      deletePhase: adminProcedure2.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB error" });
        const { eq: eq2 } = __require("drizzle-orm");
        await db.delete(phases).where(eq2(phases.id, input.id));
        return { success: true };
      }),
      // --- NIVELES ---
      createLevel: adminProcedure2.input(z2.object({
        phaseId: z2.number(),
        name: z2.string().min(1),
        description: z2.string().optional(),
        order: z2.number().int()
      })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB error" });
        await db.insert(levels).values(input);
        return { success: true };
      }),
      updateLevel: adminProcedure2.input(z2.object({
        id: z2.number(),
        name: z2.string().optional(),
        description: z2.string().optional(),
        order: z2.number().optional()
      })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB error" });
        const { eq: eq2 } = __require("drizzle-orm");
        await db.update(levels).set(input).where(eq2(levels.id, input.id));
        return { success: true };
      }),
      deleteLevel: adminProcedure2.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB error" });
        const { eq: eq2 } = __require("drizzle-orm");
        await db.delete(levels).where(eq2(levels.id, input.id));
        return { success: true };
      }),
      // --- MÓDULOS ---
      createModule: adminProcedure2.input(z2.object({
        levelId: z2.number(),
        name: z2.string().min(1),
        description: z2.string().optional(),
        order: z2.number().int()
      })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB error" });
        await db.insert(modules).values(input);
        return { success: true };
      }),
      updateModule: adminProcedure2.input(z2.object({
        id: z2.number(),
        name: z2.string().optional(),
        description: z2.string().optional(),
        order: z2.number().optional()
      })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB error" });
        const { eq: eq2 } = __require("drizzle-orm");
        await db.update(modules).set(input).where(eq2(modules.id, input.id));
        return { success: true };
      }),
      deleteModule: adminProcedure2.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB error" });
        const { eq: eq2 } = __require("drizzle-orm");
        await db.delete(modules).where(eq2(modules.id, input.id));
        return { success: true };
      }),
      // --- UNIDADES ---
      createUnit: adminProcedure2.input(z2.object({
        moduleId: z2.number(),
        name: z2.string().min(1),
        description: z2.string().optional(),
        order: z2.number().int(),
        contentType: z2.enum(["video", "podcast", "ebook", "infografia", "quiz"]),
        duration: z2.number().optional()
      })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB error" });
        await db.insert(units).values(input);
        return { success: true };
      }),
      updateUnit: adminProcedure2.input(z2.object({
        id: z2.number(),
        name: z2.string().optional(),
        description: z2.string().optional(),
        order: z2.number().optional(),
        contentType: z2.enum(["video", "podcast", "ebook", "infografia", "quiz"]).optional(),
        duration: z2.number().optional()
      })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB error" });
        const { eq: eq2 } = __require("drizzle-orm");
        await db.update(units).set(input).where(eq2(units.id, input.id));
        return { success: true };
      }),
      deleteUnit: adminProcedure2.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB error" });
        const { eq: eq2 } = __require("drizzle-orm");
        await db.delete(units).where(eq2(units.id, input.id));
        return { success: true };
      })
    })
  })
});

// _server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// _server/_core/vite.ts
import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
async function setupVite(app2, server2) {
  const { createServer: createViteServer } = await import("vite");
  const viteConfig = (await Promise.resolve().then(() => (init_vite_config(), vite_config_exports))).default;
  const serverOptions = {
    middlewareMode: true,
    hmr: { server: server2 },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(process.cwd(), "dist", "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `[Static] Build directory not found: ${distPath}. CWD: ${process.cwd()}`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// _server/_core/index.ts
var app = express2();
var server = createServer(app);
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString() });
});
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server2 = net.createServer();
    server2.listen(port, () => {
      server2.close(() => resolve(true));
    });
    server2.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
app.use(express2.json({ limit: "50mb" }));
app.use(express2.urlencoded({ limit: "50mb", extended: true }));
app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.url}`);
  next();
});
registerOAuthRoutes(app);
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext
  })
);
async function configureStaticAssets() {
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
}
configureStaticAssets().catch(console.error);
async function startLocalServer() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const preferredPort = parseInt(process.env.PORT || "3000");
    const port = await findAvailablePort(preferredPort);
    if (port !== preferredPort) {
      console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
    }
    server.listen(port, () => {
      console.log(`Server running on http://localhost:${port}/`);
    });
  }
}
startLocalServer().catch(console.error);
var index_default = app;
export {
  index_default as default
};
