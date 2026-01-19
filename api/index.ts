// @ts-nocheck
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Cache the app instance
let app: any = null;

export default async function handler(req: any, res: any) {
    if (!app) {
        try {
            console.log("[Vercel] Loading application...");

            // HACK: Force Vercel to bundle the file using require.resolve
            // This tells 'nft' (Node File Trace) to include the file in the lambda
            try { require.resolve("../server/_core/index"); } catch (e) { console.log('Resolve check skipped'); }

            // Now actually load it using ESM import (compatible with type: "module")
            const module = await import("../server/_core/index");
            app = module.default;
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
