import { emailSchema } from "@vao/shared/src/schema/email";
import { prenomSchema } from "@vao/shared/src/schema/prenom";
import { nomSchema } from "@vao/shared/src/schema/nom";
import { telephoneSchema } from "@vao/shared/src/schema/telephone";

const FicheTerritoireSchema = {
  email: emailSchema(),
  nom: nomSchema(),
  prenom: prenomSchema(),
  telephone: telephoneSchema(),
};

export default { FicheTerritoireSchema };
