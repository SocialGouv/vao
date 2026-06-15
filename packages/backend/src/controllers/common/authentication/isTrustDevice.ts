import { USER_TARGET } from "@vao/shared-bridge";
import { Request } from "express";
import jwt from "jsonwebtoken";

import { config } from "../../../config";

export function isTrustedDevice({
  req,
  userId,
  target,
}: {
  req: Request;
  userId: number;
  target: (typeof USER_TARGET)[keyof typeof USER_TARGET];
}): boolean {
  try {
    const secret =
      target === USER_TARGET.BO ? config.tokenSecret_BO : config.tokenSecret_FO;
    const trustToken = req.cookies[`VAO_trust_token-${target}-${userId}`];
    if (!secret) {
      return false;
    }

    const payload = jwt.verify(trustToken, secret);
    if (typeof payload === "string") {
      return false;
    }

    return (
      payload.__v === config.trustToken.version && payload.userId === userId
    );
  } catch {
    return false;
  }
}
