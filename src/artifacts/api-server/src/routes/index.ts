import { Router, type IRouter } from "express";
import healthRouter from "./health";
import recordsRouter from "./records";
import deviationsRouter from "./deviations";
import capaRouter from "./capa";
import { authMiddleware } from "../middlewares/auth";
import { db, trialSites, protocolRules, users } from "@workspace/db";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// Global health check (public)
router.use(healthRouter);

// Apply role & auth middleware to clinical API endpoints
router.use(authMiddleware);

// Clinical endpoints
router.use(recordsRouter);
router.use(deviationsRouter);
router.use(capaRouter);

/**
 * GET /api/sites
 * Returns active trial sites and risk scores for lookup & data entry.
 */
router.get("/sites", async (_req, res) => {
  try {
    const sites = await db.select().from(trialSites);
    res.status(200).json({ sites });
  } catch (err) {
    logger.error({ err }, "Failed to fetch trial sites");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * GET /api/rules
 * Returns active GCP protocol rules.
 */
router.get("/rules", async (_req, res) => {
  try {
    const rules = await db.select().from(protocolRules);
    res.status(200).json({ rules });
  } catch (err) {
    logger.error({ err }, "Failed to fetch protocol rules");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * GET /api/users
 * Returns system users and assigned roles.
 */
router.get("/users", async (_req, res) => {
  try {
    const allUsers = await db.select().from(users);
    res.status(200).json({ users: allUsers });
  } catch (err) {
    logger.error({ err }, "Failed to fetch users");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
