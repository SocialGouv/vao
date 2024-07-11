import * as yup from "yup";
import { DeclarationSejour, personne, prestataireUtils } from "#imports";

yup.setLocale({
  mixed: {
    required: "Le champ est obligatoire.",
  },
});

const schema = (statut) => {
  const statutsConditions = [
    DeclarationSejour.statuts.ATTENTE_8_JOUR,
    DeclarationSejour.statuts.A_MODIFIER_8J,
  ];

  return {
    nombreResponsable: yup
      .number("Ce champ doit contenir un nombre entier")
      .integer("Ce champ doit contenir un nombre entier")
      .typeError("Ce champ doit contenir un nombre entier")
      .min(
        `${statutsConditions.includes(statut) ? 1 : 0}`,
        "Vous devez saisir au moins 1 responsable d'encadrement",
      )
      .required("Ce champ doit contenir un nombre entier"),
    procedureRecrutementSupplementaire: yup
      .bool("La saisie de ce champ est obligatoire")
      .required("La saisie de ce champ est obligatoire"),
    nombreAccompagnant: yup
      .number("Ce champ doit contenir un nombre entier")
      .integer("Ce champ doit contenir un nombre entier")
      .typeError("Ce champ doit contenir un nombre entier")
      .min(
        `${statutsConditions.includes(statut) ? 1 : 0}`,
        "Vous devez saisir au moins 1 accompagnant",
      )
      .required("Ce champ doit contenir un nombre entier"),
    ...(statutsConditions.includes(statut) && {
      accompagnants: yup
        .array()
        .of(
          yup.object(
            personne.schema({
              showAdresse: false,
              showAttestation: true,
              showFonction: false,
              showCompetence: true,
              showDateNaissance: true,
              showEmail: false,
              showListeFonction: true,
              showTelephone: true,
            }),
          ),
        )
        .min(1, "Vous devez saisir au moins un accompagnant")
        .required(),
    }),
    ...(statutsConditions.includes(statut) && {
      encadrants: yup
        .array()
        .of(
          yup.object(
            personne.schema({
              showAdresse: false,
              showAttestation: true,
              showFonction: false,
              showCompetence: true,
              showDateNaissance: true,
              showEmail: false,
              showListeFonction: true,
              showTelephone: true,
            }),
          ),
        )
        .min(1, "Vous devez saisir au moins 1 encadrant")
        .required(),
    }),
    ...(statutsConditions.includes(statut) && {
      formation: yup.string().min(5, "Ce champ est obligatoire").required(),
    }),
    ...(statutsConditions.includes(statut) && {
      prestataireActivites: yup.array().of(yup.object(prestataireUtils.schema)),
    }),
    ...(statutsConditions.includes(statut) && {
      prestataireEntretien: yup.array().of(yup.object(prestataireUtils.schema)),
    }),
    ...(statutsConditions.includes(statut) && {
      prestataireMedicaments: yup
        .array()
        .of(yup.object(prestataireUtils.schema)),
    }),
    ...(statutsConditions.includes(statut) && {
      prestataireRestauration: yup
        .array()
        .of(yup.object(prestataireUtils.schema)),
    }),
    ...(statutsConditions.includes(statut) && {
      prestataireTransport: yup.array().of(yup.object(prestataireUtils.schema)),
    }),
  };
};

export default {
  schema,
};
