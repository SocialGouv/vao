import * as yup from "yup";
import { eigSchema } from "@vao/shared-ui";

const { emailSchema, prenomSchema, nomSchema } = eigSchema;

const FoUserSchema = {
  isActive: yup.boolean().required(),
  email: emailSchema(),
  nom: nomSchema(),
  prenom: prenomSchema(),
  roles: yup.array().min(1, "Il faut au moins sélectionner un role").required(),
};

export default { FoUserSchema };
