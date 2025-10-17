import { Request } from "express";

export interface User {
  id: string;
  email: string;
  roles: string[];
  territoireCode: string;
}

export interface UserRequest extends Request {
  decoded?: User;
}

export interface UserRequestWithDep extends UserRequest {
  departements?: { value: string; label: string }[];
}
