import { UsersRepository as AdminUsersRepository } from "../../admin/users/users.repository";
import {
  create as createBoUserService,
  readOneByMail as readOneByMailBoUserService,
} from "../../services/BoUser";
import { registerByEmail as createFrontUserService } from "../../services/User";
import { UsersRepository as UsagerUsersRepository } from "../../usagers/users/users.repository";
import { getPool } from "../../utils/pgpool";
import { AppHelperUser } from "./appHelper";

export const createAdminUser = async (user = {}): Promise<AppHelperUser> => {
  const timestamp = Date.now();
  const fixture = {
    email: `userbo${timestamp}@example.com`,
    nom: "Nom1",
    prenom: "Prenom1",
    roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
    territoireCode: "FRA",
    ...user,
  };
  await createBoUserService(fixture);
  const result = await readOneByMailBoUserService(fixture.email);
  return result;
};

export const createUsagersUser = async (
  user: {
    email?: string;
    nom?: string;
    password?: string;
    prenom?: string;
    siret?: string;
    statusCode?: string;
    telephone?: string;
    terCode?: string;
  } & Record<string, unknown> = {},
) => {
  const { statusCode, ...userFields } = user;
  const timestamp = Date.now();
  const fixture: any = {
    email: `frontuser${timestamp}@example.com`,
    nom: "FrontNom",
    prenom: "FrontPrenom",
    siret: `${timestamp.toString().slice(-2)}123456789012`,
    telephone: "0102030405",
    terCode: "FRA",
    ...userFields,
  };
  const result = await createFrontUserService(fixture as any);
  const created = {
    ...result.user,
    territoireCode: result.user.terCode,
  };
  if (statusCode) {
    await getPool().query(
      "UPDATE front.users SET status_code = $1 WHERE id = $2",
      [statusCode, created.id],
    );
  }
  return created;
};

export const createUsagersUserValide = async (
  user: {
    email?: string;
    nom?: string;
    prenom?: string;
    roles?: string[];
    siret?: string;
    statusCode?: string;
    telephone?: string;
    terCode?: string;
    territoireCode?: string;
  } & Record<string, unknown> = {},
) => {
  const {
    roles: roleLabels,
    statusCode,
    terCode,
    territoireCode,
    ...userFields
  } = user;
  const timestamp = Date.now();
  const fixture = {
    email: `frontuser${timestamp}@example.com`,
    nom: "FrontNom",
    prenom: "FrontPrenom",
    siret: `123456789012${timestamp.toString().slice(-2)}`,
    telephone: "0102030405",
    ter_code: terCode ?? territoireCode ?? "FRA",
    ...(statusCode ? { status_code: statusCode } : {}),
    ...userFields,
  };
  const result = await UsagerUsersRepository.create({ user: fixture });
  const created = result.user[0];
  if (roleLabels?.length) {
    await getPool().query(
      `
      INSERT INTO front.user_roles (use_id, rol_id)
      SELECT $1, r.id
      FROM front.roles r
      WHERE r.label = ANY($2)
      AND NOT EXISTS (
        SELECT 1
        FROM front.user_roles ur
        WHERE ur.use_id = $1
        AND ur.rol_id = r.id
      )
    `,
      [created.id, roleLabels],
    );
  }
  return {
    ...created,
    roles: roleLabels ?? [],
    territoireCode: created.territoireCode ?? fixture.ter_code,
  };
};

export const createAdminUserValide = async (
  user: {
    email?: string;
    nom?: string;
    prenom?: string;
    roles?: string[];
    telephone?: string;
    ter_code?: string;
    territoireCode?: string;
    verified?: boolean;
  } & Record<string, unknown> = {},
) => {
  const { roles: roleLabels, ter_code, territoireCode, ...userFields } = user;
  const timestamp = Date.now();
  const fixture = {
    email: `bouser${timestamp}@example.com`,
    nom: "boNom",
    prenom: "boPrenom",
    telephone: "0102030405",
    ter_code: ter_code ?? territoireCode ?? "FRA",
    verified: true,
    ...userFields,
  };
  const result = await AdminUsersRepository.create({ user: fixture });
  const created = result.user[0];
  if (roleLabels?.length) {
    await getPool().query(
      `
      INSERT INTO back.user_roles (use_id, rol_id)
      SELECT $1, r.id
      FROM back.roles r
      WHERE r.label = ANY($2)
      AND NOT EXISTS (
        SELECT 1
        FROM back.user_roles ur
        WHERE ur.use_id = $1
        AND ur.rol_id = r.id
      )
    `,
      [created.id, roleLabels],
    );
  }
  return {
    ...created,
    roles: roleLabels ?? [],
    territoireCode: created.territoireCode ?? fixture.ter_code,
  };
};
