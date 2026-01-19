import type { VercelRequest, VercelResponse } from '@vercel/node';

// Cache the app instance
let app: any = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!app) {
        try {
            console.log("[Vercel] Loading application...");
            // Dynamically import the app to catch initialization errors
            const module = await import("../server/_core/index");
            app = module.default;
            console.log("[Vercel] App loaded successfully.");
        } catch (error) {
            console.error("[Vercel] CRITICAL: Failed to load application", error);

            // EMERGENCY FALLBACK RESPONSE
            // This ensures we get a visible error instead of a generic 500 crash
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
