// @ts-nocheck
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Cache the app instance
let app: any = null;

export default async function handler(req: any, res: any) {
    if (!app) {
        try {
            console.log("[Vercel] Loading application...");
            // Using require ensures Vercel's static analysis detects the dependency
            // and bundles 'server/_core/index' correctly.
            const module = require("../server/_core/index");
            app = module.default || module;
            console.log("[Vercel] App loaded successfully.");
        } catch (error) {
            console.error("[Vercel] CRITICAL: Failed to load application", error);

            // EMERGENCY FALLBACK RESPONSE
            res.status(500).json({
                status: "critical_error",
                message: "Application failed to initialize",
                error: String(error),
                stack: error instanceof Error ? error.stack : undefined,
                env: {
                    node_env: process.env.NODE_ENV,
                    has_db_url: !!process.env.DATABASE_URL
                }
            });
            return;
        }
    }

    // Forward the request to the Express app
    if (app) {
        app(req, res);
    } else {
        res.status(500).send("App initialized but is null");
    }
}
