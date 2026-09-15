import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "@workspace/api-zod";
import { logger } from "../lib/logger";

export interface AuthenticatedUser {
  id?: string;
  email: string;
  role: UserRole;
  siteId?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Extracts user identity and role from headers.
 * Accepts `x-user-role` ('SITE_ADMIN' | 'RISK_MANAGER') or `x-user-email`.
 * Provides seamless persona support for development and test scenarios.
 */
export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const roleHeader = (req.headers["x-user-role"] as string | undefined)?.toUpperCase();
  const emailHeader = req.headers["x-user-email"] as string | undefined;
  const siteIdHeader = req.headers["x-site-id"] as string | undefined;

  let role: UserRole = "RISK_MANAGER";

  if (roleHeader === "SITE_ADMIN" || roleHeader === "SITE_ADMINISTRATOR") {
    role = "SITE_ADMIN";
  } else if (roleHeader === "RISK_MANAGER") {
    role = "RISK_MANAGER";
  } else if (emailHeader && emailHeader.includes("admin")) {
    role = "SITE_ADMIN";
  }

  req.user = {
    email: emailHeader || (role === "SITE_ADMIN" ? "site.admin@meridian.test" : "maya.ortiz@meridian.test"),
    role,
    siteId: siteIdHeader || null,
  };

  next();
}

/**
 * Guards routes by requiring specified roles.
 * Returns 403 Forbidden with descriptive error if role requirement is not met.
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user || !user.role) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication is required to access this endpoint.",
      });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      logger.warn(
        { userRole: user.role, requiredRoles: allowedRoles, path: req.path },
        "Access denied by role policy",
      );
      res.status(403).json({
        error: "Forbidden",
        message: `Role '${user.role}' is not authorized. Required role(s): ${allowedRoles.join(", ")}.`,
      });
      return;
    }

    next();
  };
}
