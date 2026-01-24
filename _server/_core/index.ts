const express = require('express');
const { createExpressMiddleware } = require('@trpc/server/adapters/express');
const { registerOAuthRoutes } = require('./oauth.js');
const { appRouter } = require('../routers.js');
const { createContext } = require('./context.js');
const { getDb } = require('../db.js');
const { sql } = require('drizzle-orm');

const app = express();

// Simplest possible route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "alive", time: new Date().toISOString() });
});

// DB Check
app.get("/api/health/db", async (req, res) => {
  try {
    const db = await getDb();
    if (db) {
      await db.execute(sql`SELECT 1`);
      return res.json({ status: "connected" });
    }
    res.status(500).json({ status: "no_db" });
  } catch (e) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

registerOAuthRoutes(app);

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log('http://localhost:' + port));
}

module.exports = app;
