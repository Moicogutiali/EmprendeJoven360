import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

import { supabase } from "./supabase.js";
import { getUserByOpenId, upsertUser } from "../db.js";

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // 1. Try Supabase Auth First (Modern)
    const authHeader = opts.req.headers.authorization;
    if (authHeader?.startsWith('Bearer ') && supabase) {
      const token = authHeader.split(' ')[1];
      const { data: { user: sbUser }, error } = await supabase.auth.getUser(token);

      if (!error && sbUser) {
        // Sync user with our DB
        await upsertUser({
          openId: sbUser.id,
          email: sbUser.email || null,
          name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || null,
          loginMethod: 'supabase',
          lastSignedIn: new Date(),
        });

        const dbUser = await getUserByOpenId(sbUser.id);
        if (dbUser) user = dbUser;
      }
    }

    // 2. Fallback to Manus Cookie Auth (Legacy/Bypass)
    if (!user) {
      user = await sdk.authenticateRequest(opts.req);
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    // We don't want to crash 500 if auth fails here.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}


