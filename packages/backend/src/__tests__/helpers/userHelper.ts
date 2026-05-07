import { UsersRepository as AdminUsersRepository } from "../../repositories/admin/Users";
import { UsersRepository as UsagerUsersRepository } from "../../repositories/usagers/Users";
import {
  create as createBoUserService,
  readOneByMail as readOneByMailBoUserService,
} from "../../services/BoUser";
import { registerByEmail as createFrontUserService } from "../../services/User";
import { getPool } from "../../utils/pgpool";

export const createAdminUser = async (user = {}) => {
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

export const createUsagersUser = async (user = {}) => {
  const timestamp = Date.now();
  const fixture: any = {
    email: `frontuser${timestamp}@example.com`,
    nom: "FrontNom",
    prenom: "FrontPrenom",
    siret: `${timestamp.toString().slice(-2)}123456789012`,
    telephone: "0102030405",
    terCode: "FRA",
    ...user,
  };
  const result = await createFrontUserService(fixture as any);
  return {
    ...result.user,
    territoireCode: result.user.terCode,
  };
};

export const createUsagersUserValide = async (user = {}) => {
  const timestamp = Date.now();
  const fixture = {
    email: `frontuser${timestamp}@example.com`,
    nom: "FrontNom",
    prenom: "FrontPrenom",
    siret: `123456789012${timestamp.toString().slice(-2)}`,
    telephone: "0102030405",
    terCode: "FRA",
    ...user,
  };
  const result = await UsagerUsersRepository.create({ user: fixture });
  return result.user[0];
};

export const createAdminUserValide = async (user = {}) => {
  const timestamp = Date.now();
  const fixture = {
    email: `bouser${timestamp}@example.com`,
    nom: "boNom",
    prenom: "boPrenom",
    telephone: "0102030405",
    ter_code: "FRA",
    verified: true,
    ...user,
  };
  const result = await AdminUsersRepository.create({ user: fixture });
  return result.user[0];
};

export const assignRolesToUsager = async (
  userId: number,
  roleLabels: string[],
): Promise<void> => {
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
    [userId, roleLabels],
  );
};
