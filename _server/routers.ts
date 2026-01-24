import { COOKIE_NAME } from "@shared/const";
import { eq, and } from "drizzle-orm";

import { getSessionCookieOptions } from "./_core/cookies.js";
import { systemRouter } from "./_core/systemRouter.js";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc.js";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { upsertUser, getUserById, getPhases, getLevelsByPhase, getModulesByLevel, getUnitsByModule, getUnitById, getGamificationByUser, getInitialDiagnosticByUser, getAdaptiveRouteByUser, getChatbotInteractionByUserAndRole, getStudentMentors, getContentByUnit } from "./db.js";
import { users, gamification, initialDiagnostics, adaptiveRoutes, chatbotInteractions, userProgress, evaluationAnswers, mentorAssignments, phases, levels, modules, units } from "../drizzle/schema.js";
import { invokeLLM } from "./_core/llm.js";
import { CHATBOT_PROMPTS, DIAGNOSTIC_ANALYSIS_PROMPT } from "./prompts.js";
import { getDb } from "./db.js";

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

    // Obtener estructura completa (Fases + Niveles)
    getStructure: publicProcedure.query(async () => {
      const { getPhasesWithLevels } = await import("./db.js");
      return getPhasesWithLevels();
    }),


    // Obtener niveles de una fase

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
        const unit = await getUnitById(input.unitId);
        if (!unit) return null;

        // También traer el contenido detallado
        const content = await getContentByUnit(input.unitId);
        return { ...unit, detailedContent: content[0] || null };
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

        await db.update(gamification)
          .set({
            totalPoints: newPoints,
            currentLevel: newLevel,
            updatedAt: new Date(),
          })
          .where(eq(gamification.userId, ctx.user.id));

        return { success: true, totalPoints: newPoints, currentLevel: newLevel };
      }),


    // Completar una unidad y ganar puntos
    completeUnit: protectedProcedure
      .input(z.object({ unitId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });


        // 1. Verificar si ya está completada
        const existing = await db.select().from(userProgress)
          .where(and(eq(userProgress.userId, ctx.user.id), eq(userProgress.unitId, input.unitId)))
          .limit(1);

        if (existing.length > 0 && existing[0].status === 'completado') {
          return { success: true, alreadyCompleted: true };
        }

        // 2. Marcar como completada
        if (existing.length > 0) {
          await db.update(userProgress)
            .set({
              status: 'completado',
              percentageComplete: 100,
              completedAt: new Date(),
              lastAccessedAt: new Date()
            })
            .where(and(eq(userProgress.userId, ctx.user.id), eq(userProgress.unitId, input.unitId)));
        } else {
          await db.insert(userProgress).values({
            userId: ctx.user.id,
            unitId: input.unitId,
            status: 'completado',
            percentageComplete: 100,
            completedAt: new Date(),
            lastAccessedAt: new Date()
          });
        }

        // 3. Otorgar puntos (100 por unidad)
        const POINTS_PER_UNIT = 100;
        const currentGamif = await getGamificationByUser(ctx.user.id);

        const newPoints = ((currentGamif?.totalPoints || 0) + POINTS_PER_UNIT);
        const newLevel = Math.floor(newPoints / 1000) + 1;

        if (currentGamif) {
          await db.update(gamification)
            .set({
              totalPoints: newPoints,
              currentLevel: newLevel,
              updatedAt: new Date(),
              lastActivityDate: new Date()
            })
            .where(eq(gamification.userId, ctx.user.id));
        } else {
          await db.insert(gamification).values({
            userId: ctx.user.id,
            totalPoints: newPoints,
            currentLevel: newLevel,
            streak: 1,
            badges: [],
            achievements: [],
            lastActivityDate: new Date(),
            updatedAt: new Date()
          });
        }

        return { success: true, pointsAwarded: POINTS_PER_UNIT, newTotalPoints: newPoints };
      }),

    // Obtener IDs de unidades completadas
    getCompletedUnits: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const results = await db.select({ unitId: userProgress.unitId })
        .from(userProgress)
        .where(and(eq(userProgress.userId, ctx.user.id), eq(userProgress.status, 'completado')));

      return results.map(r => r.unitId);
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


        // Analizar con IA si es posible
        let aiResult = { resultLevel: input.resultLevel || 1, reasoning: "Cálculo básico", recommendedPath: [] };
        try {
          const result = await invokeLLM({
            messages: [
              { role: "system", content: DIAGNOSTIC_ANALYSIS_PROMPT },
              { role: "user", content: JSON.stringify(input.responses) }
            ],
            responseFormat: { type: "json_object" }
          });

          if (result.choices[0].message.content) {
            const parsed = JSON.parse(typeof result.choices[0].message.content === 'string' ? result.choices[0].message.content : "{}");
            aiResult = { ...aiResult, ...parsed };
          }
        } catch (e) {
          console.error("AI Diagnostic Error:", e);
        }

        const [diagnostic] = await db.insert(initialDiagnostics).values({
          userId: ctx.user.id,
          responses: input.responses,
          resultLevel: aiResult.resultLevel,
          completedAt: new Date(),
        }).returning();

        // Crear ruta adaptativa
        await db.insert(adaptiveRoutes).values({
          userId: ctx.user.id,
          recommendedPath: aiResult.recommendedPath,
          reasoning: aiResult.reasoning,
          generatedAt: new Date(),
        });

        // Actualizar nivel del usuario en gamificación si es necesario
        await db.update(gamification)
          .set({ currentLevel: aiResult.resultLevel })
          .where(eq(gamification.userId, ctx.user.id));

        return { success: true, aiResult };
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
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });


        // 1. Obtener historial previo
        const interaction = await getChatbotInteractionByUserAndRole(ctx.user.id, input.role);
        const history = interaction?.messages || [];

        // 2. Preparar mensajes para LLM
        const chatMessages = [
          { role: "system", content: CHATBOT_PROMPTS[input.role] },
          ...history.map(m => ({ role: m.role as any, content: m.content })),
          { role: "user", content: input.message }
        ];

        // 3. Invocar LLM
        const result = await invokeLLM({ messages: chatMessages });
        const assistantResponse = result.choices[0].message.content as string;

        // 4. Actualizar historial en DB
        const newMessages = [
          ...history,
          { role: "user", content: input.message, timestamp: new Date().toISOString() },
          { role: "assistant", content: assistantResponse, timestamp: new Date().toISOString() }
        ];

        if (interaction) {
          await db.update(chatbotInteractions)
            .set({ messages: newMessages, updatedAt: new Date() })
            .where(eq(chatbotInteractions.id, interaction.id));
        } else {
          await db.insert(chatbotInteractions).values({
            userId: ctx.user.id,
            role: input.role,
            messages: newMessages,
          });
        }

        return {
          success: true,
          response: assistantResponse,
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

    // ===== GESTIÓN DE CONTENIDO (ADMIN) =====
    learning: router({
      // --- FASES ---
      createPhase: adminProcedure
        .input(z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          order: z.number().int(),
        }))
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB error' });
          await db.insert(phases).values(input);
          return { success: true };
        }),

      updatePhase: adminProcedure
        .input(z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          order: z.number().optional(),
        }))
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB error' });
          await db.update(phases).set(input).where(eq(phases.id, input.id));
          return { success: true };
        }),


      deletePhase: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB error' });
          await db.delete(phases).where(eq(phases.id, input.id));
          return { success: true };
        }),


      // --- NIVELES ---
      createLevel: adminProcedure
        .input(z.object({
          phaseId: z.number(),
          name: z.string().min(1),
          description: z.string().optional(),
          order: z.number().int(),
        }))
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB error' });
          await db.insert(levels).values(input);
          return { success: true };
        }),

      updateLevel: adminProcedure
        .input(z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          order: z.number().optional(),
        }))
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB error' });
          await db.update(levels).set(input).where(eq(levels.id, input.id));
          return { success: true };
        }),


      deleteLevel: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB error' });
          await db.delete(levels).where(eq(levels.id, input.id));
          return { success: true };
        }),


      // --- MÓDULOS ---
      createModule: adminProcedure
        .input(z.object({
          levelId: z.number(),
          name: z.string().min(1),
          description: z.string().optional(),
          order: z.number().int(),
        }))
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB error' });
          await db.insert(modules).values(input);
          return { success: true };
        }),

      updateModule: adminProcedure
        .input(z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          order: z.number().optional(),
        }))
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB error' });
          await db.update(modules).set(input).where(eq(modules.id, input.id));
          return { success: true };
        }),


      deleteModule: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB error' });
          await db.delete(modules).where(eq(modules.id, input.id));
          return { success: true };
        }),


      // --- UNIDADES ---
      createUnit: adminProcedure
        .input(z.object({
          moduleId: z.number(),
          name: z.string().min(1),
          description: z.string().optional(),
          order: z.number().int(),
          contentType: z.enum(["video", "podcast", "ebook", "infografia", "quiz"]),
          duration: z.number().optional(),
        }))
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB error' });
          await db.insert(units).values(input);
          return { success: true };
        }),

      updateUnit: adminProcedure
        .input(z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          order: z.number().optional(),
          contentType: z.enum(["video", "podcast", "ebook", "infografia", "quiz"]).optional(),
          duration: z.number().optional(),
        }))
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB error' });
          await db.update(units).set(input).where(eq(units.id, input.id));
          return { success: true };
        }),


      deleteUnit: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB error' });
          await db.delete(units).where(eq(units.id, input.id));
          return { success: true };
        }),

    }),
  }),
});

export type AppRouter = typeof appRouter;
