import { emailSchema } from "@vao/shared-ui/src/schema/email";
import { prenomSchema } from "@vao/shared-ui/src/schema/prenom";
import { nomSchema } from "@vao/shared-ui/src/schema/nom";
import { telephoneSchema } from "@vao/shared-ui/src/schema/telephone";

const FicheTerritoireSchema = {
  email: emailSchema(),
  nom: nomSchema(),
  prenom: prenomSchema(),
  telephone: telephoneSchema(),
};

export default { FicheTerritoireSchema };
