import { randomUUID } from "crypto";

export function getOvaUser() {
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

export function getAgentsRegionalIDFUser() {
  const user = {
    username: "tnra.agent.idf@example.com",
    password: process.env.E2E_BO_PASSWORD || "Azertyuiop1!",
  };
  console.log(
    "agentsRegionalIDF",
    user.username,
    user.password.slice(0, 3) + "***",
  );
  return user;
}
