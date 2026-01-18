import { COOKIE_NAME } from "@shared/const";
import { eq } from "drizzle-orm";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { upsertUser, getUserById, getPhases, getLevelsByPhase, getModulesByLevel, getUnitsByModule, getUnitById, getGamificationByUser, getInitialDiagnosticByUser, getAdaptiveRouteByUser, getChatbotInteractionByUserAndRole, getStudentMentors } from "./db";
import { users, gamification, initialDiagnostics, adaptiveRoutes, chatbotInteractions, userProgress, evaluationAnswers, mentorAssignments } from "../drizzle/schema";
import { getDb } from "./db";

// Procedimiento protegido solo para administradores
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Solo administradores pueden acceder' });
  }
  return next({ ctx });
});

// Procedimiento protegido solo para mentores
const mentorProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== 'mentor' && ctx.user?.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Solo mentores pueden acceder' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  // ===== AUTENTICACIÓN Y USUARIOS =====
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        email: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        const { eq } = require("drizzle-orm");
        await db.update(users)
          .set({
            name: input.name ?? undefined,
            email: input.email ?? undefined,
            updatedAt: new Date(),
          })
          .where(eq(users.id, ctx.user.id));
        
        return { success: true };
      }),
  }),

  // ===== ESTRUCTURA DE APRENDIZAJE =====
  learning: router({
    // Obtener todas las fases
    getPhases: publicProcedure.query(async () => {
      return getPhases();
    }),
    
    // Obtener niveles de una fase
    getLevelsByPhase: publicProcedure
      .input(z.object({ phaseId: z.number() }))
      .query(async ({ input }) => {
        return getLevelsByPhase(input.phaseId);
      }),
    
    // Obtener módulos de un nivel
    getModulesByLevel: publicProcedure
      .input(z.object({ levelId: z.number() }))
      .query(async ({ input }) => {
        return getModulesByLevel(input.levelId);
      }),
    
    // Obtener unidades de un módulo
    getUnitsByModule: publicProcedure
      .input(z.object({ moduleId: z.number() }))
      .query(async ({ input }) => {
        return getUnitsByModule(input.moduleId);
      }),
    
    // Obtener detalles de una unidad
    getUnitDetails: publicProcedure
      .input(z.object({ unitId: z.number() }))
      .query(async ({ input }) => {
        return getUnitById(input.unitId);
      }),
  }),

  // ===== PROGRESO Y GAMIFICACIÓN =====
  progress: router({
    // Obtener gamificación del usuario
    getGamification: protectedProcedure.query(async ({ ctx }) => {
      let gamif = await getGamificationByUser(ctx.user.id);
      
      // Si no existe, crear uno nuevo
      if (!gamif) {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        await db.insert(gamification).values({
          userId: ctx.user.id,
          totalPoints: 0,
          currentLevel: 1,
          streak: 0,
          badges: [],
          achievements: [],
        });
        
        gamif = await getGamificationByUser(ctx.user.id);
      }
      
      return gamif;
    }),
    
    // Actualizar puntos del usuario
    addPoints: protectedProcedure
      .input(z.object({ points: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        const current = await getGamificationByUser(ctx.user.id);
        if (!current) throw new TRPCError({ code: 'NOT_FOUND', message: 'Gamification not found' });
        
        const newPoints = (current.totalPoints || 0) + input.points;
        const newLevel = Math.floor(newPoints / 1000) + 1;
        
        const { eq } = require("drizzle-orm");
        await db.update(gamification)
          .set({
            totalPoints: newPoints,
            currentLevel: newLevel,
            updatedAt: new Date(),
          })
          .where(eq(gamification.userId, ctx.user.id));
        
        return { success: true, totalPoints: newPoints, currentLevel: newLevel };
      }),
  }),

  // ===== DIAGNÓSTICO INICIAL =====
  diagnostic: router({
    // Obtener diagnóstico del usuario
    getDiagnostic: protectedProcedure.query(async ({ ctx }) => {
      return getInitialDiagnosticByUser(ctx.user.id);
    }),
    
    // Guardar respuestas del diagnóstico
    saveDiagnostic: protectedProcedure
      .input(z.object({
        responses: z.record(z.string(), z.unknown()),
        resultLevel: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        await db.insert(initialDiagnostics).values({
          userId: ctx.user.id,
          responses: input.responses,
          resultLevel: input.resultLevel,
          completedAt: new Date(),
        });
        
        return { success: true };
      }),
  }),

  // ===== RUTAS ADAPTATIVAS =====
  adaptiveRoute: router({
    // Obtener ruta adaptativa del usuario
    getRoute: protectedProcedure.query(async ({ ctx }) => {
      return getAdaptiveRouteByUser(ctx.user.id);
    }),
  }),

  // ===== CHATBOT =====
  chatbot: router({
    // Obtener conversación del chatbot
    getConversation: protectedProcedure
      .input(z.object({ role: z.enum(['mentor', 'asesor', 'motivador']) }))
      .query(async ({ ctx, input }) => {
        return getChatbotInteractionByUserAndRole(ctx.user.id, input.role);
      }),
    
    // Enviar mensaje al chatbot
    sendMessage: protectedProcedure
      .input(z.object({
        role: z.enum(['mentor', 'asesor', 'motivador']),
        message: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Aquí se integraría con el LLM para generar respuesta
        return {
          success: true,
          message: 'Mensaje recibido',
        };
      }),
  }),

  // ===== MENTORÍA =====
  mentorship: router({
    // Obtener mentores del estudiante
    getMyMentors: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'emprendedor') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Solo emprendedores pueden tener mentores' });
      }
      return getStudentMentors(ctx.user.id);
    }),
  }),

  // ===== ADMINISTRACIÓN =====
  admin: router({
    // Obtener todos los usuarios
    getUsers: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      return db.select().from(users);
    }),
    
    // Actualizar rol de usuario
    updateUserRole: adminProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(['emprendedor', 'mentor', 'admin']),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        const { eq } = require("drizzle-orm");
        await db.update(users)
          .set({ role: input.role, updatedAt: new Date() })
          .where(eq(users.id, input.userId));
        
        return { success: true };
      }),
    
    // Asignar mentor a estudiante
    assignMentor: adminProcedure
      .input(z.object({
        mentorId: z.number(),
        studentId: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        await db.insert(mentorAssignments).values({
          mentorId: input.mentorId,
          studentId: input.studentId,
          notes: input.notes ?? undefined,
          active: true,
        });
        
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
