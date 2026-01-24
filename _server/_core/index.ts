import "dotenv/config";

// --- GLOBAL ERROR SHIELD (Permanent Solution for Vercel Diagnostics) ---
process.on("uncaughtException", (err) => {
  console.error("[CRITICAL] Uncaught Exception:", err.message);
  console.error(err.stack);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("[CRITICAL] Unhandled Rejection at:", promise, "reason:", reason);
});

console.log("[Critical] Server initialization sequence started...");
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

// Sentry.init removed completely

const app = express();
const server = createServer(app);

// Simple Health Check
(app as any).get("/api/health", (req: any, res: any) => {
  res.json({ status: "ok", time: new Date().toISOString(), vercel: !!process.env.VERCEL });
});

// --- DIAGNOSTIC ROUTE (Bypass everything) ---
(app as any).get("/api/debug", (req: any, res: any) => {
  res.json({
    status: "diagnostic_running",
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      APP_ID: !!process.env.VITE_APP_ID,
      DB_URL: !!process.env.DATABASE_URL,
    },
    cwd: process.cwd(),
    timestamp: new Date().toISOString(),
  });
});

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

// --- SYNC CONFIGURATION (Safest for Vercel) ---
// Configure body parser with larger size limit for file uploads
(app as any).use(express.json({ limit: "50mb" }));
(app as any).use(express.urlencoded({ limit: "50mb", extended: true }));

// Custom Logging Middleware to debug Vercel requests
(app as any).use((req: any, res: any, next: any) => {
  console.log(`[Request] ${req.method} ${req.url}`);
  next();
});

// OAuth callback under /api/oauth/callback AND Bypass
registerOAuthRoutes(app as any);

// tRPC API
(app as any).use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// --- ASYNC CONFIGURATION (Vite / Static) ---
// We wrap this in a function but don't block the export
async function configureStaticAssets() {
  if (process.env.NODE_ENV === "development") {
    await setupVite(app as any, server);
  } else {
    serveStatic(app as any);
  }
}

// Start static asset config (fire and forget for Vercel cold boot, 
// usually Vercel handles static files via vercel.json rewrites so this is fallback)
configureStaticAssets().catch(console.error);

// --- SERVER LISTENING (Local Dev Only) ---
async function startLocalServer() {
  // Only start listening if NOT in Vercel/Production serverless mode
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

// --- GLOBAL EXPRESS ERROR HANDLER (Vercel Diagnostic) ---
(app as any).use((err: any, req: any, res: any, next: any) => {
  console.error("[CRITICAL] Unhandled Reqeust Error:", err);
  if (!res.headersSent) {
    res.status(500).json({
      status: "critical_runtime_error",
      message: err.message || "Unknown Error",
      stack: err.stack,
      env: { VERCEL: !!process.env.VERCEL, NODE_ENV: process.env.NODE_ENV },
    });
  }
});

export default app;
