const InputTypes = {
  TEXT: "text",
  RADIO: "radio",
  SELECT: "select",
  MULTISELECT: "multiselect",
  NUMBER: "number",
  TO_FORMAT: "to_format",
};

const ouiNon = {
  false: "Non",
  true: "Oui",
};

const IPersonneMorale = {
  raisonSociale: {
    inputType: InputTypes.TEXT,
    label: "Raison sociale",
  },
  siren: {
    inputType: InputTypes.TEXT,
    label: "Siren",
  },
  siret: {
    inputType: InputTypes.TEXT,
    label: "Siret",
  },
  statut: {
    inputType: InputTypes.TEXT,
    label: "Statut",
  },
  telephoneEP: {
    inputType: InputTypes.TEXT,
    label: "Téléphone",
  },
  adresseShort: {
    inputType: InputTypes.TEXT,
    label: "Adresse",
  },
};

const IPersonnePhysique = {
  prenom: {
    inputType: InputTypes.TEXT,
    label: "Prénom",
  },
  nomUsage: {
    inputType: InputTypes.TEXT,
    label: "Nom",
  },
  siret: {
    inputType: InputTypes.TEXT,
    label: "Siret",
  },
  profession: {
    inputType: InputTypes.TEXT,
    label: "Profession",
  },
  telephone: {
    inputType: InputTypes.TEXT,
    label: "Téléphone",
  },
  adresseDomicile: {
    inputType: InputTypes.TO_FORMAT,
    label: "Adresse Domicile",
    formatter: (value) => value.label,
  },
  adresseSiege: {
    inputType: InputTypes.TO_FORMAT,
    label: "Adresse Siège",
    formatter: (value) => value.label,
  },
  adresseIdentique: {
    inputType: InputTypes.RADIO,
    label:
      "L'adresse du siège des activités de VAO est elle celle du domicile ?\n",
    options: ouiNon,
  },
};

const IResponsableSejour = {
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
  email: {
    inputType: InputTypes.TEXT,
    label: "Email",
  },
  telephone: {
    inputType: InputTypes.TEXT,
    label: "Téléphone",
  },
  adresse: {
    inputType: InputTypes.TO_FORMAT,
    label: "Adresse",
    formatter: (value) => value.label,
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
    options: ouiNon,
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
      aucune: "Sans objet",
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

const IHebergement = {
  dateDebut: {
    inputType: InputTypes.TEXT,
    label: "Du",
  },
  dateFin: {
    inputType: InputTypes.TEXT,
    label: "Au",
  },
  nom: {
    inputType: InputTypes.TEXT,
    label: "Nom",
  },
};

const IAttestation = {
  aCertifie: {
    inputType: InputTypes.RADIO,
    label:
      "Je certifie sur l'honneur que les renseignements portés sur cette déclaration sont exacts",
    options: ouiNon,
  },
  at: {
    inputType: InputTypes.TEXT,
    label: "Date",
  },
  nom: {
    inputType: InputTypes.TEXT,
    label: "Nom",
  },
  prenom: {
    inputType: InputTypes.TEXT,
    label: "Prénom",
  },
  qualite: {
    inputType: InputTypes.TEXT,
    label: "Qualité",
  },
};

const IHebergementInformationLocaux = {
  type: {
    inputType: InputTypes.RADIO,
    label: "Type du lieu d'hébergement",
    options: {
      hotel: "Hôtel",
      meuble_tourisme: "Meublé de tourisme",
      residence_tourisme: "Résidence de tourisme, chambre d'hôte",
      camping: "Camping, caravaning, mobile home",
      autre: "Autre",
    },
  },
  visiteLocaux: {
    inputType: InputTypes.RADIO,
    label: "Une visite des locaux par l’organisateur a-t-elle été effectuée ? ",
    options: ouiNon,
  },
  accessibilite: {
    inputType: InputTypes.RADIO,
    label: "Accessibilité",
    options: {
      accessible: "Accessible",
      non_adapte: "Signalé comme non adapté",
      commentaires: "Commentaires",
      non_renseigne: "Non renseigné",
    },
  },
  pension: {
    inputType: InputTypes.RADIO,
    label: "Accessibilité",
    options: {
      accessible: "Accessible",
      non_adapte: "Signalé comme non adapté",
      commentaires: "Commentaires",
      non_renseigne: "Non renseigné",
    },
  },
  prestationsHotelieres: {
    inputType: InputTypes.MULTISELECT,
    label: "Prestations hôtelières assurées par le lieu d’accueil",
  },
  descriptionLieuHebergement: {
    inputType: InputTypes.RADIO,
    label:
      "Description du lieu d’hébergement (parties communes et notamment équipements sanitaires) ?",
    options: ouiNon,
  },
  nombreLits: {
    inputType: InputTypes.NUMBER,
    label: "Nombre de lits dans le lieu d'hébergement",
  },
  nombreLitsSuperposes: {
    inputType: InputTypes.NUMBER,
    label: "Nombre de lits superposés inclus",
  },
  litsDessus: {
    inputType: InputTypes.RADIO,
    label:
      "Pour les lits superposés, les lits « du dessus » seront-ils occupés par des vacanciers ?",
    options: ouiNon,
  },
  nombreMaxPersonnesCouchage: {
    inputType: InputTypes.NUMBER,
    label: "Nombre maximum de personnes prévues par espace de couchage",
  },
  couchageIndividuel: {
    inputType: InputTypes.RADIO,
    label: "Chaque vacancier bénéficie-t-il d’un couchage individuel ? ",
    options: ouiNon,
  },
  rangementIndividuel: {
    inputType: InputTypes.RADIO,
    label:
      "Chaque vacancier bénéficie t-il d’un espace de rangement des affaires personnelles ? ",
    options: ouiNon,
  },
  chambresUnisexes: {
    inputType: InputTypes.RADIO,
    label: "Les femmes et les hommes dorment-ils dans des lieux séparés ? ",
    options: ouiNon,
  },
  chambresDoubles: {
    inputType: InputTypes.RADIO,
    label: "Les couples de vacanciers bénéficient t-ils de chambres doubles ? ",
    options: ouiNon,
  },
  amenagementsSpecifiques: {
    inputType: InputTypes.RADIO,
    label:
      "Des aménagements spécifiques des locaux sont-ils prévus pour accueillir les vacanciers ? ",
    options: ouiNon,
  },
  precisionAmenagementsSpecifiques: {
    inputType: InputTypes.TEXT,
    label: "Précisez ",
  },
};
const IHebergementInformationsTransport = {
  vehiculesAdaptes: {
    inputType: InputTypes.RADIO,
    label: "Les véhicules utilisés sont-ils adaptés ? ",
    options: ouiNon,
  },
  deplacementProximite: {
    inputType: InputTypes.TEXT,
    label:
      "Précisez la fréquence, les distances et le mode de transport utilisé pour les déplacements de proximité",
  },
  excursion: {
    inputType: InputTypes.TEXT,
    label:
      "Précisez la fréquence, les distances et le mode de transport utilisé pour les excursions",
  },
  rejoindreEtape: {
    inputType: InputTypes.TEXT,
    label: "Précisez le mode de transport utilisé pour rejoindre cette étape  ",
  },
};

export default {
  InputTypes,
  IPersonneMorale,
  IPersonnePhysique,
  IVacancier,
  Ipersonnel,
  IProjetSejour,
  ITransport,
  ISanitaire,
  IResponsableSejour,
  IHebergement,
  IHebergementInformationLocaux,
  IHebergementInformationsTransport,
  IAttestation,
};
