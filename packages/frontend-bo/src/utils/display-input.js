const InputTypes = {
  TEXT: "text",
  RADIO: "radio",
  SELECT: "select",
  MULTISELECT: "multiselect",
  NUMBER: "number",
};

const ouiNon = {
  false: "Non",
  true: "Oui",
};

const Iorganisateur = {
  nom: {
    inputType: InputTypes.TEXT,
    label: "Nom",
  },
  prenom: {
    inputType: InputTypes.TEXT,
    label: "Prénom",
  },
  fonction: {
    inputType: InputTypes.TEXT,
    label: "Fonction",
  },
  telephone: {
    inputType: InputTypes.TEXT,
    label: "Téléphone",
  },
  email: {
    inputType: InputTypes.TEXT,
    label: "Email",
  },
  adresse: {
    inputType: InputTypes.TEXT,
    label: "Adresse",
  },
};

const IVacancier = {
  effectifPrevisionnel: {
    inputType: InputTypes.NUMBER,
    label: "Effectif prévisionnel des vacanciers",
  },
  effectifPrevisionnelFemme: {
    inputType: InputTypes.NUMBER,
    label: "Femme",
  },
  effectifPrevisionnelHomme: {
    inputType: InputTypes.NUMBER,
    label: "Homme",
  },
  trancheAge: {
    inputType: InputTypes.MULTISELECT,
    label: "Tranches d'âge",
  },
  typeDeficiences: {
    inputType: InputTypes.MULTISELECT,
    label: "Type de déficiences",
  },
};

const Ipersonnel = {
  nombreResponsable: {
    inputType: InputTypes.NUMBER,
    label:
      "Nombre total de personnes responsables du déroulement du séjour sur le(s) lieu(x) de séjour",
  },
  procedureRecrutementSupplementaire: {
    inputType: InputTypes.RADIO,
    label:
      "Procédure en cas de recrutement de personnels supplémentaires durant le séjour",
    options: ouiNon,
  },
  nombreAccompagnant: {
    inputType: InputTypes.NUMBER,
    label: "Nombre total d'accompagnants sur le(s) lieu(x) de séjour",
  },
};

const IProjetSejour = {
  destination: {
    inputType: InputTypes.MULTISELECT,
    label: "Destination",
  },
  activitesSportives: {
    inputType: InputTypes.MULTISELECT,
    label: "Sports et loisirs",
  },
  activitesCulturelles: {
    inputType: InputTypes.MULTISELECT,
    label: "Culture et découverte",
  },
};

const ITransport = {
  responsableTransportLieuSejour: {
    inputType: InputTypes.RADIO,
    label: "Qui est responsable du transport jusqu'au lieu de séjour ? ",
    options: {
      vacanciers: "Les vacanciers viennent par leurs propres moyens",
      organisateur:
        "Le transport vers le lieu de séjour est assuré par l'organisateur",
    },
  },
  modeTransport: {
    inputType: InputTypes.MULTISELECT,
    label: "Précisez le ou les modes de transport utilisés",
  },
  precisionModeOrganisation: {
    inputType: InputTypes.TEXT,
    label:
      "Précisez le mode d’organisation retenu (conditions d’accompagnement des vacanciers, gestion des correspondances, lieux de prise en charge, temps d’attente, etc.)",
  },
  deplacementDurantSejour: {
    inputType: InputTypes.RADIO,
    label: "Des déplacements sont-ils prévus durant le séjour ?",
    options: {
      oui: "Oui",
      non: "Non",
    },
  },
};

const ISanitaire = {
  dispositionsSpecifiques: {
    inputType: InputTypes.RADIO,
    label:
      "Des dispositions d’ordre sanitaire spécifiques sont-elles prévues ?",
    options: ouiNon,
  },

  precisionDispositionsSpecifiques: {
    inputType: InputTypes.TEXT,
    label: "Précisez ?",
  },
  constitutionEquipe: {
    inputType: InputTypes.MULTISELECT,
    label: "L’équipe comprend-elle ?",
  },
  precisionConstitutionEquipe: {
    inputType: InputTypes.TEXT,
    label: "Précisez",
  },
  troussePharmacie: {
    inputType: InputTypes.RADIO,
    label: "Présence d’une trousse à pharmacie de premier secours ?",
    options: ouiNon,
  },
  responsableAdministrationMedicament: {
    inputType: InputTypes.MULTISELECT,
    label:
      "Personne désignée en charge de la distribution et de l’administration des médicaments et de l’enregistrement de l’administration ?",
  },
  precisionResponsableAdministrationMedicament: {
    inputType: InputTypes.TEXT,
    label: "Précisez",
  },
  stockageMedicamentSecurise: {
    inputType: InputTypes.RADIO,
    label: "Présence d’une trousse à pharmacie de premier secours ?",
    options: ouiNon,
  },
  precisionStockageMedicamentSecurise: {
    inputType: InputTypes.TEXT,
    label: "Précisez",
  },
  conservationMedicamentThermosensible: {
    inputType: InputTypes.RADIO,
    label:
      "Un dispositif est-il prévu pour la conservation des médicaments thermosensibles ?",
    options: ouiNon,
  },
  precisionConservationMedicament: {
    inputType: InputTypes.TEXT,
    label: "Précisez",
  },
  individualisationMedicaments: {
    inputType: InputTypes.RADIO,
    label: "Individualisation des médicaments ?",
    options: ouiNon,
  },
  precisionIndividualisationMedicaments: {
    inputType: InputTypes.TEXT,
    label: "Précisez",
  },
  preparationPilluliers: {
    inputType: InputTypes.RADIO,
    label: "Individualisation des médicaments ?",
    options: {
      aucune: "Aucune méthode",
      prepares_prealablement:
        "Piluliers préparés préalablement au séjour par le vacancier, sa famille, le représentant légal, l’établissement de résidence habituelle, le médecin",
      au_fur_et_a_mesure: "Piluliers préparés durant le séjour",
    },
  },
  precisionPreparationPilluliers: {
    inputType: InputTypes.TEXT,
    label: "Précisez",
  },
  prescriptionMedicaleJointe: {
    inputType: InputTypes.RADIO,
    label: "une prescription médicale est-elle jointe à chaque pilulier ?",
    options: ouiNon,
  },
  protocoleModificationTraitement: {
    inputType: InputTypes.RADIO,
    label:
      "Existe-t-il un protocole en cas de modification de traitement en cours de séjour ?",
    options: ouiNon,
  },
  precisionProtocoleModificationTraitement: {
    inputType: InputTypes.TEXT,
    label: "Précisez",
  },
  ficheSuiviMedicaments: {
    inputType: InputTypes.RADIO,
    label:
      "Existe-t-il une fiche de suivi de la distribution, de l’administration et de l’enregistrement des médicaments ?",
    options: ouiNon,
  },
  protocoleEvacuation: {
    inputType: InputTypes.RADIO,
    label:
      "Existe-t-il un protocole d’évacuation et de rapatriement des vacanciers si nécessaire au cours du séjour ?",
    options: ouiNon,
  },
  precisionProtocoleEvacuation: {
    inputType: InputTypes.TEXT,
    label: "Précisez",
  },
  protocoleAccident: {
    inputType: InputTypes.RADIO,
    label:
      "Existe-t-il un protocole d’évacuation et de rapatriement des vacanciers si nécessaire au cours du séjour ?",
    options: ouiNon,
  },
  precisionProtocoleAccident: {
    inputType: InputTypes.TEXT,
    label: "Précisez",
  },
  protocoleReorientation: {
    inputType: InputTypes.RADIO,
    label:
      "Existe-t-il un protocole en cas de chute, d’intoxication (alimentaire, médicamenteuse, etc.) ou autre accident ?",
    options: ouiNon,
  },
  precisionProtocoleReorientation: {
    inputType: InputTypes.TEXT,
    label: "Précisez",
  },
  protocoleCanicule: {
    inputType: InputTypes.RADIO,
    label:
      "Existe-t-il un protocole en cas d’alerte canicule (locaux, transports…) ?",
    options: ouiNon,
  },
  precisionProtocoleCanicule: {
    inputType: InputTypes.TEXT,
    label: "Précisez",
  },

  gestionBudgetPersonnel: {
    inputType: InputTypes.TEXT,
    label: "Précisez",
  },
};

export default {
  InputTypes,
  Iorganisateur,
  IVacancier,
  Ipersonnel,
  IProjetSejour,
  ITransport,
  ISanitaire,
};
