import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext; } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "emprendedor",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

describe("Diagnostic Router", () => {
  it("should save diagnostic responses", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.diagnostic.saveDiagnostic({
      responses: {
        q1: "none",
        q2: "no",
        q3: "learn",
        q4: "low",
        q5: "tech",
      },
      resultLevel: 1,
    });

    expect(result).toEqual({ success: true });
  });

  it("should retrieve diagnostic for user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First save a diagnostic
    await caller.diagnostic.saveDiagnostic({
      responses: {
        q1: "experienced",
        q2: "clear",
      },
      resultLevel: 2,
    });

    // Then retrieve it
    const diagnostic = await caller.diagnostic.getDiagnostic();
    expect(diagnostic).toBeDefined();
  });
});

describe("Progress Router", () => {
  it("should get or create gamification for user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const gamification = await caller.progress.getGamification();

    expect(gamification).toBeDefined();
    expect(gamification?.userId).toBe(ctx.user.id);
    expect(gamification?.totalPoints).toBeGreaterThanOrEqual(0);
    expect(gamification?.currentLevel).toBeGreaterThanOrEqual(1);
  });

  it("should add points to gamification", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const initialGamification = await caller.progress.getGamification();
    const initialPoints = initialGamification?.totalPoints || 0;

    const result = await caller.progress.addPoints({ points: 100 });

    expect(result.success).toBe(true);
    expect(result.totalPoints).toBe(initialPoints + 100);
  });

  it("should calculate level based on points", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Add points to reach level 2 (1000+ points)
    await caller.progress.addPoints({ points: 1500 });

    const gamification = await caller.progress.getGamification();
    expect(gamification?.currentLevel).toBe(2);
  });
});

describe("Learning Router", () => {
  it("should get phases", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const phases = await caller.learning.getPhases();
    expect(Array.isArray(phases)).toBe(true);
  });

  it("should get levels by phase", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const levels = await caller.learning.getLevelsByPhase({ phaseId: 1 });
    expect(Array.isArray(levels)).toBe(true);
  });

  it("should get modules by level", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const modules = await caller.learning.getModulesByLevel({ levelId: 1 });
    expect(Array.isArray(modules)).toBe(true);
  });

  it("should get units by module", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const units = await caller.learning.getUnitsByModule({ moduleId: 1 });
    expect(Array.isArray(units)).toBe(true);
  });
});

describe("Auth Router", () => {
  it("should get current user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const user = await caller.auth.me();
    expect(user).toEqual(ctx.user);
  });

  it("should update user profile", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.updateProfile({
      name: "Updated Name",
      bio: "New bio",
    });

    expect(result.success).toBe(true);
  });
});

describe("Chatbot Router", () => {
  it("should get conversation by role", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const conversation = await caller.chatbot.getConversation({ role: "mentor" });
    // Should return undefined or empty conversation initially
    expect(conversation === undefined || Array.isArray(conversation?.messages)).toBe(true);
  });

  it("should send message to chatbot", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chatbot.sendMessage({
      role: "mentor",
      message: "Hola, necesito ayuda con mi idea de negocio",
    });

    expect(result.success).toBe(true);
  });
});
