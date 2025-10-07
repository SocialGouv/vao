import * as yup from "yup";
import { emailSchema } from "@vao/shared-ui/src/schema/email";
import { prenomSchema } from "@vao/shared-ui/src/schema/prenom";
import { nomSchema } from "@vao/shared-ui/src/schema/nom";
import {
  serviceCompetenceDEP,
  serviceCompetenceNAT,
  serviceCompetenceREG,
} from "./serviceCompetenceOptions";

const BoUserSchema = {
  isActive: yup.boolean().required(),
  email: emailSchema(),
  nom: nomSchema(),
  prenom: prenomSchema(),
  roles: yup.array().min(1, "Il faut au moins sélectionner un role").required(),
  serviceCompetence: yup
    .string()
    .oneOf([
      serviceCompetenceNAT.value,
      serviceCompetenceDEP.value,
      serviceCompetenceREG.value,
    ])
    .required(),
  territoireCode: yup.string().when("serviceCompetence", {
    is: (val) => {
      return (
        val === serviceCompetenceDEP.value || val === serviceCompetenceREG.value
      );
    },
    then: (schema) => {
      return schema.required(
        "Le territoire  doit obligatoirement être renseigné",
      );
    },
    otherwise: (schema) => schema.nullable().strip(),
  }),
};

export default { BoUserSchema };
