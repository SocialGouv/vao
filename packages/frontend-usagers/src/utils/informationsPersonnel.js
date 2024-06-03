import * as yup from "yup";
import { personne, DeclarationSejour, prestataireUtils } from "#imports";

yup.setLocale({
  mixed: {
    required: "Le champ est obligatoire.",
  },
});

const schema = (statut) => {
  return {
    nombreResponsable: yup
      .number("Ce champ doit contenir un nombre entier")
      .integer("Ce champ doit contenir un nombre entier")
      .typeError("Ce champ doit contenir un nombre entier")
      .min(
        `${statut === DeclarationSejour.statuts.ATTENTE_8_JOUR ? 1 : 0}`,
        "Vousdevez saisir au moins 1 responsable d'encadrement",
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
        `${statut === DeclarationSejour.statuts.ATTENTE_8_JOUR ? 1 : 0}`,
        "Vousdevez saisir au moins 1 accompagnant",
      )
      .required("Ce champ doit contenir un nombre entier"),
    ...(statut === DeclarationSejour.statuts.ATTENTE_8_JOUR && {
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
              showTelephone: false,
            }),
          ),
        )
        .min(1, "Vous devez saisir au moins un accompagnant")
        .required(),
    }),
    ...(statut === DeclarationSejour.statuts.ATTENTE_8_JOUR && {
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
              showTelephone: false,
            }),
          ),
        )
        .min(1, "Vous devez saisir au moins 1 encadrant")
        .required(),
    }),
    ...(statut === DeclarationSejour.statuts.ATTENTE_8_JOUR && {
      formation: yup.string().min(5, "Ce champ est obligatoire").required(),
    }),
    ...(statut === DeclarationSejour.statuts.ATTENTE_8_JOUR && {
      prestataireActivites: yup.array().of(yup.object(prestataireUtils.schema)),
    }),
    ...(statut === DeclarationSejour.statuts.ATTENTE_8_JOUR && {
      prestataireEntretien: yup.array().of(yup.object(prestataireUtils.schema)),
    }),
    ...(statut === DeclarationSejour.statuts.ATTENTE_8_JOUR && {
      prestataireMedicaments: yup
        .array()
        .of(yup.object(prestataireUtils.schema)),
    }),
    ...(statut === DeclarationSejour.statuts.ATTENTE_8_JOUR && {
      prestataireRestauration: yup
        .array()
        .of(yup.object(prestataireUtils.schema)),
    }),
    ...(statut === DeclarationSejour.statuts.ATTENTE_8_JOUR && {
      prestataireTransport: yup.array().of(yup.object(prestataireUtils.schema)),
    }),
  };
};

export default {
  schema,
};
