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
    password: "password123",
    prenom: "FrontPrenom",
    siret: `123456789012${timestamp.toString().slice(-2)}`,
    telephone: "0102030405",
    terCode: "FRA",
    ...user,
  };
  const result = await createFrontUserService(fixture);
  return result.user;
};
