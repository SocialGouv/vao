import type { BasicRoute } from "@vao/shared-bridge";
import { Request, Response } from "express";

export interface User {
  id: string;
  email: string;
  roles: string[];
  territoireCode: string;
}

export interface UserRequest extends Request {
  decoded?: User;
}

export interface RouteRequest<T extends BasicRoute>
  extends Omit<UserRequest, "body" | "query" | "params"> {
  body: T["body"];
  query: T["query"];
  params: T["params"];
  validatedBody?: T["body"];
  validatedQuery?: T["query"];
  validatedParams?: T["params"];
}
export interface RouteResponse<T extends BasicRoute>
  extends Response<T["response"]> {
  // eslint-disable-next-line no-unused-vars
  json: (body: T["response"]) => this;
}
