import { eigSchema } from "@vao/shared-ui";

const { emailSchema, prenomSchema, nomSchema, telephoneSchema } = eigSchema;

const FicheTerritoireSchema = {
  email: emailSchema(),
  nom: nomSchema(),
  prenom: prenomSchema(),
  telephone: telephoneSchema(),
};

export default { FicheTerritoireSchema };
