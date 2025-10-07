import * as yup from "yup";
import { emailSchema } from "@vao/shared-ui/src/schema/email";
import { prenomSchema } from "@vao/shared-ui/src/schema/prenom";
import { nomSchema } from "@vao/shared-ui/src/schema/nom";

const FoUserSchema = {
  isActive: yup.boolean().required(),
  email: emailSchema(),
  nom: nomSchema(),
  prenom: prenomSchema(),
  roles: yup.array().min(1, "Il faut au moins sélectionner un role").required(),
};

export default { FoUserSchema };
