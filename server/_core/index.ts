// @ts-nocheck
import "dotenv/config";
import * as Sentry from "@sentry/node";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

// Sentry initialization disabled temporarily to debug Vercel Crash
// Sentry.init({
//   dsn: process.env.SENTRY_DSN || "https://placeholder@sentry.io/123",
//   tracesSampleRate: 1.0,
// } as any);

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

const app = express();
const server = createServer(app);

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

export default app;
