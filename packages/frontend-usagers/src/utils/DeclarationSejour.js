import * as yup from "yup";
import dayjs from "dayjs";
import { logger } from "#imports";

import informationsVacanciers from "./informationsVacanciers";
import protocoleTransport from "./protocoleTransport";
import protocoleSanitaire from "./protocoleSanitaire";
import projetSejour from "./projetSejour";
import hebergementUtils from "./hebergementUtils";

const log = logger("utils/DeclarationSejour");

function isSejourComplet(hebergements, dateDebut, dateFin) {
  log.d("isSejourComplet - IN", { hebergements, dateDebut, dateFin });
  if (hebergements.length === 0) {
    return false;
  }

  let memoDate = dateDebut;

  for (let i = 0; i < hebergements.length; i++) {
    log.d("isSejourComplet", hebergements[i].dateDebut, memoDate);
    const dateDebut = dayjs(hebergements[i].dateDebut).format("YYYY-MM-DD");
    if (dateDebut !== memoDate) {
      return false;
    }
    memoDate = dayjs(hebergements[i].dateFin).format("YYYY-MM-DD");
  }

  log.d("isSejourComplet", memoDate, dateFin);
  if (memoDate !== dateFin) {
    return false;
  }
  return true;
}

const baseSchema = {
  libelle: yup.string().typeError("le libellé est requis").required(),
  dateDebut: yup
    .date("Vous devez saisir une date valide au format JJ/MM/AAAA")
    .typeError("date invalide")
    .min(new Date(), "La date doit être supérieure à la date du jour.")
    .required("La saisie de ce champ est obligatoire"),
  dateFin: yup
    .date("Vous devez saisir une date valide au format JJ/MM/AAAA")
    .typeError("date invalide")
    .when("dateDebut", (dateDebut, schema) => {
      return schema.test({
        test: (dateFin) => !!dateDebut && dayjs(dateFin) > dayjs(dateDebut),
        message: "La date de fin doit être supérieure à la date de début",
      });
    })
    .required("La saisie de ce champ est obligatoire"),
  responsableSejour: yup
    .object({
      nom: yup.string().required(),
      prenom: yup.string().required(),
      fonction: yup.string().required(),
      adresse: yup.object().required(),
      telephone: yup.string().required(),
      email: yup.string().required(),
    })
    .required(),
};

const informationsPersonnelSchema = {
  nombreResponsable: yup
    .number("Ce champ doit contenir un nombre entier")
    .integer("Ce champ doit contenir un nombre entier")
    .typeError("Ce champ doit contenir un nombre entier")
    .required("Ce champ doit contenir un nombre entier"),
  procedureRecrutementSupplementaire: yup
    .bool("La saisie de ce champ est obligatoire")
    .required("La saisie de ce champ est obligatoire"),
  nombreAccompagnant: yup
    .number("Ce champ doit contenir un nombre entier")
    .integer("Ce champ doit contenir un nombre entier")
    .typeError("Ce champ doit contenir un nombre entier")
    .required("Ce champ doit contenir un nombre entier"),
};

const hebergementDetailsSchema = {
  dateDebut: yup.date().required(),
  dateFin: yup.date().required(),
  hebergementId: yup
    .string()
    .required("le choix d'un hébergement dans la liste est obligatoire"),
  coordonnees: yup.object(hebergementUtils.coordonneesSchema),
  informationsLocaux: yup.object({
    ...hebergementUtils.informationsLocauxSchema,
    justificatifERP: yup.mixed().required(),
  }),
  informationsTransport: yup.object({
    ...hebergementUtils.informationsTransportSchema,
    rejoindreEtape: yup
      .string()
      .min(
        1,
        "Il est impératif de préciser le mode de transport utilisé pour rejoindre le lieu d'hébergement",
      )
      .required(),
  }),
};

const attestationSchema = {
  aCertifie: yup
    .boolean()
    .oneOf([true], "Vous devez certifier de ces informations")
    .required(),
  nom: yup.string().min(1, "Il est impératif de préciser votre nom").required(),
  prenom: yup
    .string()
    .min(1, "Il est impératif de préciser votre prénom")
    .required(),
  qualite: yup
    .string()
    .min(1, "Il est impératif de préciser votre qualité")
    .required(),
  at: yup.date().required(),
};

const hebergementSchema = (dateDebut, dateFin) => ({
  sejourItinerant: yup.boolean().required(),
  sejourEtranger: yup.boolean().when("sejourItinerant", {
    is: (sejourItinerant) => !!sejourItinerant,
    then: (sejourEtranger) => sejourEtranger.required(),
    otherwise: (sejourEtranger) => sejourEtranger.nullable(),
  }),
  hebergements: yup
    .array()
    .of(yup.object(hebergementDetailsSchema))
    .test(
      "sejourComplet",
      "La liste des hébergements n'est pas complète",
      (hebergements) => isSejourComplet(hebergements, dateDebut, dateFin),
    )
    .required("le choix d'un hébergement dans la liste est obligatoire"),
});

const schema = (dateDebut, dateFin) => ({
  ...baseSchema,
  informationsVacanciers: yup.object(informationsVacanciers.schema),
  informationsPersonnel: yup.object(informationsPersonnelSchema),
  informationsTransport: yup.object(protocoleTransport.schema),
  informationsSanitaires: yup.object(protocoleSanitaire.schema),
  informationsProjetSejour: yup.object(projetSejour.schema),
  hebergement: yup.object(hebergementSchema(dateDebut, dateFin)),
  attestation: yup.object(attestationSchema),
});

export default {
  isSejourComplet,
  baseSchema,
  informationsPersonnelSchema,
  hebergementDetailsSchema,
  hebergementSchema,
  schema,
};
