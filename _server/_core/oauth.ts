// @ts-nocheck
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { SignJWT } from "jose"; // Ensure this is explicitly imported
import type { Express, Request, Response } from "express";
import type { Express, Request, Response } from "express";
import * as db from "../db.js";
import { getSessionCookieOptions } from "./cookies.js";
import { sdk } from "./sdk.js";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = (req.query as Record<string, any>)[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      (res as any).status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        (res as any).status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      (res as any).cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      (res as any).redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      (res as any).status(500).json({ error: "OAuth callback failed" });
    }
  });

  // --- RUTA DE ACCESO DIRECTO (Bypass - Pure Mock) ---
  // Versión "Blindada": No usa DB ni SDK para evitar crashes por configuración
  app.get("/api/oauth/bypass", async (req: Request, res: Response) => {
    try {
      console.log("[Bypass] Starting Pure Mock sequence...");

      const ONE_YEAR_MS = 31536000000;
      const fakeUser = {
        openId: "bypass-admin-001", // Must start with 'bypass-' to trigger SDK mock logic
        name: "Admin Local",
        email: "admin@emprendejoven.dev"
      };

      // Generar JWT manualmente sin usar el SDK para evitar errores de red o DB
      const secret = process.env.JWT_SECRET || "super-secret-lms-key-2026";
      const secretKey = new TextEncoder().encode(secret);

      const sessionToken = await new SignJWT({
        openId: fakeUser.openId,
        appId: "emprendejoven-360",
        name: fakeUser.name,
      })
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setExpirationTime(Math.floor((Date.now() + ONE_YEAR_MS) / 1000))
        .sign(secretKey);

      console.log("[Bypass] Manual JWT created.");

      // Establecer Cookie manualmente
      const isProduction = process.env.NODE_ENV === "production";
      (res as any).cookie(COOKIE_NAME, sessionToken, {
        path: "/",
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: ONE_YEAR_MS
      });

      console.log("[Bypass] Redirecting...");
      (res as any).redirect(302, "/");

    } catch (error) {
      console.error("[Auth] Bypass CRITICAL FAILURE", error);
      (res as any).status(500).json({
        error: "Bypass Critical Failure",
        message: String(error),
        stack: (error as Error).stack
      });
    }
  });
}
