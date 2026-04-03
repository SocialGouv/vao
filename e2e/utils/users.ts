import { randomUUID } from "crypto";

export function getUser() {
  const username =
    process.env.E2E_USERNAME || `e2e-${randomUUID()}@example.com`;
  const password = process.env.E2E_PASSWORD || "Azertyuiop1!";

  const params = {
    username,
    password,
  };

  console.log("e2e user", params);
  return params;
}

export const agentsRegionalIDF = {
  email: "tnra.agent.idf@example.com",
  password: process.env.E2E_BO_PASSWORD || "Azertyuiop1!",
};
