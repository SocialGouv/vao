import { Request } from "express";
import type { User } from "src/schemas/user.schema";

type AuthGuardPayload = { email: User["email"]; id: User["id"] };

export type AuthGuardRequest = Request & {
  user: AuthGuardPayload;
};
