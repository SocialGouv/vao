const yup = require("yup");
const dayjs = require("dayjs");

const logger = require("../utils/logger");

const informationsVacanciersSchema = require("./parts/informations-vacanciers");
const projetSejourSchema = require("./parts/projet-sejour");
const protocoleTransportSchema = require("./parts/protocoleTransport");
const protocoleSanitaireSchema = require("./parts/protocoleSanitaire");
const hebergementUtils = require("./hebergement");
const adresseSchema = require("./parts/adresse.js");

const log = logger(module.filename);

function isSejourComplet(hebergements, dateDebut, dateFin) {
  log.d("isSejourComplet - IN", { dateDebut, dateFin, hebergements });
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
        message: "La date de fin doit être supérieure à la date de début",
        test: (dateFin) => !!dateDebut && dayjs(dateFin) > dayjs(dateDebut),
      });
    })
    .required("La saisie de ce champ est obligatoire"),
  libelle: yup.string().typeError("le libellé est requis").required(),
  responsableSejour: yup
    .object({
      adresse: yup
        .object(adresseSchema({ isFromAPIAdresse: false }))
        .required(),
      email: yup.string().required(),
      fonction: yup.string().required(),
      nom: yup.string().required(),
      prenom: yup.string().required(),
      telephone: yup.string().required(),
    })
    .required(),
};

const informationsPersonnelSchema = {
  nombreAccompagnant: yup
    .number("Ce champ doit contenir un nombre entier")
    .integer("Ce champ doit contenir un nombre entier")
    .typeError("Ce champ doit contenir un nombre entier")
    .required("Ce champ doit contenir un nombre entier"),
  nombreResponsable: yup
    .number("Ce champ doit contenir un nombre entier")
    .integer("Ce champ doit contenir un nombre entier")
    .typeError("Ce champ doit contenir un nombre entier")
    .required("Ce champ doit contenir un nombre entier"),
  procedureRecrutementSupplementaire: yup
    .bool("La saisie de ce champ est obligatoire")
    .required("La saisie de ce champ est obligatoire"),
};

const hebergementDetailsSchema = {
  coordonnees: yup.object(hebergementUtils.coordonneesSchema()),
  dateDebut: yup.date().required(),
  dateFin: yup.date().required(),
  hebergementId: yup
    .number()
    .required("le choix d'un hébergement dans la liste est obligatoire"),
  informationsLocaux: yup.object({
    ...hebergementUtils.informationsLocauxSchema(),
    justificatifERP: yup.mixed().required(),
  }),
  informationsTransport: yup.object({
    ...hebergementUtils.informationsTransportSchema(),
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
  at: yup.date().required(),
  nom: yup.string().min(1, "Il est impératif de préciser votre nom").required(),
  prenom: yup
    .string()
    .min(1, "Il est impératif de préciser votre prénom")
    .required(),
  qualite: yup
    .string()
    .min(1, "Il est impératif de préciser votre qualité")
    .required(),
};

const hebergementSchema = (dateDebut, dateFin) => ({
  hebergements: yup
    .array()
    .of(yup.object(hebergementDetailsSchema))
    .test(
      "sejourComplet",
      "La liste des hébergements n'est pas complète",
      (hebergements) => isSejourComplet(hebergements, dateDebut, dateFin),
    )
    .required("le choix d'un hébergement dans la liste est obligatoire"),
  sejourEtranger: yup.boolean().when("sejourItinerant", {
    is: (sejourItinerant) => !!sejourItinerant,
    otherwise: (sejourEtranger) => sejourEtranger.nullable().strip(),
    then: (sejourEtranger) => sejourEtranger.required(),
  }),
  sejourItinerant: yup.boolean().required(),
});

const schema = (dateDebut, dateFin) => ({
  ...baseSchema,
  attestation: yup.object(attestationSchema),
  hebergement: yup.object(hebergementSchema(dateDebut, dateFin)),
  informationsPersonnel: yup.object(informationsPersonnelSchema),
  informationsProjetSejour: yup.object(projetSejourSchema()),
  informationsSanitaires: yup.object(protocoleSanitaireSchema()),
  informationsTransport: yup.object(protocoleTransportSchema()),
  informationsVacanciers: yup.object(informationsVacanciersSchema()),
});

module.exports = schema;
