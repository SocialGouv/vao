import { UsersRepository as AdminUsersRepository } from "../../../repositories/admin/Users";
import { UsersRepository as UsagerUsersRepository } from "../../../repositories/usagers/Users";
import { create as createBoUserService } from "../../../services/BoUser";
import { registerByEmail as createFrontUserService } from "../../../services/User";

export const createAdminUser = async (user = {}) => {
  const fixture = {
    email: "user1@example.com",
    nom: "Nom1",
    prenom: "Prenom1",
    roles: ["eig", "DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
    territoireCode: "FRA",
    ...user,
  };
  return await createBoUserService(fixture);
};

export const createUsagersUser = async (user = {}) => {
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
  const result = await createFrontUserService(fixture);
  return result.user;
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
  return result.user;
};

export const createAdminUserValide = async (user = {}) => {
  const timestamp = Date.now();
  const fixture = {
    email: `bouser${timestamp}@example.com`,
    nom: "boNom",
    prenom: "boPrenom",
    telephone: "0102030405",
    terCode: "FRA",
    verified: true,
    ...user,
  };
  const result = await AdminUsersRepository.create({ user: fixture });
  return result.user;
};
