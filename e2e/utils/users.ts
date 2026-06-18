export function getOvaUser() {
  const username = process.env.E2E_USERNAME || "tnra.ovapphy.idf@example.com";
  const password = process.env.E2E_PASSWORD || "Azertyuiop1!";

  const params = {
    username,
    password,
  };

  console.log(
    "[ova user",
    params.username,
    params.password.slice(0, 2) + "***]",
  );
  return params;
}

export function getAgentRegionalIDFUser() {
  const user = {
    username: "tnra.agent.idf@example.com",
    password: process.env.E2E_BO_PASSWORD || "Azertyuiop1!",
  };
  console.log(
    "[bo user idf",
    user.username,
    user.password.slice(0, 2) + "***]",
  );
  return user;
}

export function getAgentDepartement75Paris() {
  const user = {
    username: "tnra.agent.75-paris@example.com",
    password: process.env.E2E_BO_PASSWORD || "Azertyuiop1!",
  };
  console.log("[bo user 75", user.username, user.password.slice(0, 2) + "***]");
  return user;
}
