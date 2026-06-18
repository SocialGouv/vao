import { DEMANDE_SEJOUR_STATUTS } from "@vao/shared-bridge";

import { getPool } from "../../utils/pgpool";

type Depot8jStatut =
  | typeof DEMANDE_SEJOUR_STATUTS.ATTENTE_8_JOUR
  | typeof DEMANDE_SEJOUR_STATUTS.A_MODIFIER_8J;

type CreateDemandeSejourParams = {
  departementSuivi?: string;
  idFonctionnelle?: string;
  libelle?: string;
  organisme?: object;
  organismeId: number;
  personnel?: object;
  statut?: string;
  vacanciers?: object;
};

export const createDemandeSejour = async ({
  departementSuivi = "75",
  idFonctionnelle = "TSTMSG001",
  libelle = "Declaration message test",
  organisme,
  organismeId,
  personnel,
  statut = "BROUILLON",
  vacanciers,
}: CreateDemandeSejourParams): Promise<number> => {
  const declarationResponse = await getPool().query(
    `INSERT INTO front.demande_sejour (
      statut,
      departement_suivi,
      organisme_id,
      id_fonctionnelle,
      libelle,
      date_debut,
      date_fin,
      duree,
      periode,
      responsable_sejour
    )
    VALUES (
      $4,
      $5,
      $1,
      $2,
      $3,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '1 day',
      1,
      'vacances',
      '{"email":"responsable-sejour@test.fr","nom":"Resp","prenom":"Test"}'::jsonb
    )
    RETURNING id`,
    [organismeId, idFonctionnelle, libelle, statut, departementSuivi],
  );

  const declarationId = declarationResponse.rows[0]?.id ?? 1;

  if (
    personnel !== undefined &&
    vacanciers !== undefined &&
    organisme !== undefined
  ) {
    await getPool().query(
      `UPDATE front.demande_sejour
       SET personnel = $1::jsonb,
           vacanciers = $2::jsonb,
           organisme = $3::jsonb
       WHERE id = $4`,
      [
        JSON.stringify(personnel),
        JSON.stringify(vacanciers),
        JSON.stringify(organisme),
        declarationId,
      ],
    );
  }

  return declarationId;
};

export const deleteDemandeSejour = async (
  demandeSejourId: number,
): Promise<void> => {
  await getPool().query(
    `DELETE FROM front.demande_sejour_to_hebergement
     WHERE demande_sejour_id = $1`,
    [demandeSejourId],
  );

  await getPool().query("DELETE FROM front.demande_sejour WHERE id = $1", [
    demandeSejourId,
  ]);
};

const buildPersonnel8j = () => ({
  accompagnants: [
    {
      attestation: true,
      competence: "Secourisme",
      dateNaissance: "1990-05-15",
      listeFonction: ["restauration"],
      nom: "Martin",
      prenom: "Paul",
      telephone: "0102030405",
    },
  ],
  encadrants: [
    {
      attestation: true,
      competence: "Premiers secours",
      dateNaissance: "1988-03-20",
      listeFonction: ["transport des vacanciers"],
      nom: "Dupont",
      prenom: "Jean",
      telephone: "0102030406",
    },
  ],
  formation: "Formation sécurité obligatoire de 40 heures minimum",
  nombreAccompagnant: 1,
  nombreResponsable: 1,
  procedureRecrutementSupplementaire: false,
});

const buildAgrementDeposeFixture = () => ({
  dateObtention: "2020-01-15",
  file: { name: "arrete-agrement.pdf" },
  numero: "AGR-TEST-001",
  regionObtention: "IDF",
});

export const buildOrganismePersonneMoralePorteurForDepose = () => ({
  agrement: buildAgrementDeposeFixture(),
  personneMorale: {
    adresse: "10 rue de la Paix 75002 Paris",
    email: "contact@organisme-test.fr",
    nomCommercial: "Nom commercial test",
    porteurAgrement: true,
    raisonSociale: "Organisme test dépôt",
    representantsLegaux: [
      { fonction: "Présidente", nom: "Martin", prenom: "Claire" },
    ],
    siren: "123456789",
    siret: "12345678901234",
    statut: "Association loi 1901",
    telephone: "0102030405",
  },
  typeOrganisme: "personne_morale",
});

export const buildOrganismeEtablissementSecondaireForDepose = () => ({
  agrement: buildAgrementDeposeFixture(),
  personneMorale: {
    adresse: "12 rue Secondaire 75003 Paris",
    email: "etab@organisme-test.fr",
    etablissementPrincipal: {
      adresse: "10 rue de la Paix 75002 Paris",
      email: "siege@organisme-test.fr",
      nomCommercial: "Nom commercial siège",
      raisonSociale: "Organisme siège agréé",
      siret: "98765432109876",
      telephone: "0102030406",
    },
    nomCommercial: "Nom commercial secondaire",
    porteurAgrement: false,
    raisonSociale: "Établissement secondaire test",
    representantsLegaux: [
      { fonction: "Directrice", nom: "Bernard", prenom: "Anne" },
    ],
    siren: "123456789",
    siret: "12345678901234",
    statut: "Association loi 1901",
    telephone: "0102030405",
  },
  typeOrganisme: "personne_morale",
});

export const buildOrganismePersonnePhysiqueForDepose = () => ({
  agrement: buildAgrementDeposeFixture(),
  personnePhysique: {
    adresseDomicile: { label: "5 avenue Domicile 75010 Paris" },
    adresseIdentique: true,
    adresseSiege: { label: "5 avenue Domicile 75010 Paris" },
    nomNaissance: "Dupont",
    nomUsage: "Dupont",
    prenom: "Marie",
    profession: "Directrice de centre",
    siret: "12345678901234",
    telephone: "0102030405",
  },
  typeOrganisme: "personne_physique",
});

export const prepareDemandeSejourForDepose = async ({
  declarationId,
  fileUuid,
  hebergementId,
  depot8jStatut,
  organisme,
}: {
  declarationId: number;
  fileUuid: string;
  hebergementId: number;
  depot8jStatut?: Depot8jStatut;
  organisme?: object;
}): Promise<void> => {
  const dateDebut = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const dateFin = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const visiteLocauxAt = "2020-01-01";

  const hebergement = {
    hebergements: [
      {
        coordonnees: {
          adresse: {
            cleInsee: "75056",
            codeInsee: "75056",
            codePostal: "75001",
            coordinates: [2.35, 48.85],
            departement: "75",
            label: "1 rue de Test 75001 Paris",
          },
          email: "hebergement@test.com",
          nomGestionnaire: "Gestionnaire Test",
          numTelephone1: "0102030405",
        },
        dateDebut,
        dateFin,
        hebergementId,
        informationsLocaux: {
          accessibilite: "accessible",
          accessibilitePrecision: "Description accessibilite",
          amenagementsSpecifiques: false,
          chambresDoubles: true,
          chambresUnisexes: true,
          couchageIndividuel: true,
          descriptionLieuHebergement: "Description du lieu",
          fileDernierArreteAutorisationMaire: null,
          fileDerniereAttestationSecurite: {
            uuid: fileUuid,
          },
          fileReponseExploitantOuProprietaire: null,
          litsDessus: false,
          nombreLits: 10,
          nombreLitsSuperposes: 10,
          nombreMaxPersonnesCouchage: 10,
          pension: "pension_complete",
          precisionAmenagementsSpecifiques: "Aucun",
          prestationsHotelieres: ["blanchisseries", "entretien_locaux"],
          rangementIndividuel: true,
          reglementationErp: true,
          type: "hotel",
          visiteLocaux: true,
          visiteLocauxAt,
        },
        informationsTransport: {
          deplacementProximite: "Transport en commun",
          excursion: "Excursions disponibles",
          vehiculesAdaptes: true,
        },
        nom: "Hebergement test depose",
      },
    ],
    sejourItinerant: false,
  };

  await getPool().query(
    `UPDATE front.hebergement
     SET
       file_derniere_attestation_securite = $1::uuid,
       type_id = (SELECT id FROM front.hebergement_type WHERE value = $2),
       type_pension_id = (
         SELECT id FROM front.hebergement_type_pension WHERE value = $3
       ),
       visite_locaux_at = $4::date
     WHERE id = $5`,
    [fileUuid, "hotel", "pension_complete", visiteLocauxAt, hebergementId],
  );

  await getPool().query(
    `UPDATE front.demande_sejour_to_hebergement
     SET date_debut = $1::date, date_fin = $2::date
     WHERE demande_sejour_id = $3 AND hebergement_id = $4`,
    [dateDebut, dateFin, declarationId, hebergementId],
  );

  await getPool().query(
    `UPDATE front.demande_sejour
     SET
       date_debut = $1::date,
       date_fin = $2::date,
       libelle = $3,
       responsable_sejour = $4::jsonb,
       vacanciers = $5::jsonb,
       personnel = $6::jsonb,
       projet_sejour = $7::jsonb,
       transport = $8::jsonb,
       sanitaires = $9::jsonb,
       organisme = $10::jsonb,
       hebergement = $11::jsonb,
       sejour_itinerant = false
     WHERE id = $12`,
    [
      dateDebut,
      dateFin,
      "Depose OK complet",
      JSON.stringify({
        adresse: { label: "1 rue Test" },
        email: "responsable@test.com",
        fonction: "Responsable",
        nom: "Doe",
        prenom: "John",
        telephone: "0102030405",
      }),
      JSON.stringify({
        effectifPrevisionnel: 10,
        effectifPrevisionnelFemme: 5,
        effectifPrevisionnelHomme: 5,
        precisionDeficiences: "Déficiences motrices légères",
        trancheAge: ["18_40"],
        typeDeficiences: ["moteur"],
      }),
      JSON.stringify(
        depot8jStatut
          ? buildPersonnel8j()
          : {
              nombreAccompagnant: 1,
              nombreResponsable: 1,
              procedureRecrutementSupplementaire: false,
            },
      ),
      JSON.stringify({
        activitesBienEtre: [],
        activitesCulturelles: [],
        activitesPersonnelPrevu: "Animation prévue sur place",
        activitesSportives: [],
        destination: [],
      }),
      JSON.stringify({
        deplacementDurantSejour: false,
        files: [],
        responsableTransportLieuSejour: ["vacanciers"],
        vehiculesAdaptes: false,
      }),
      JSON.stringify({
        accordCabinetMedical: false,
        conservationMedicamentThermosensible: false,
        constitutionEquipe: [],
        dispositionsSpecifiques: false,
        ficheSuiviMedicaments: false,
        files: [],
        gestionBudgetPersonnel: "organisateur",
        individualisationMedicaments: false,
        preparationPilluliers: "aucune",
        prescriptionMedicaleJointe: false,
        protocoleAccident: false,
        protocoleCanicule: false,
        protocoleEvacuation: false,
        protocoleModificationTraitement: false,
        protocoleReorientation: false,
        responsableAdministrationMedicament: [],
        stockageMedicamentSecurise: false,
        troussePharmacie: false,
      }),
      JSON.stringify(
        organisme ?? buildOrganismePersonneMoralePorteurForDepose(),
      ),
      JSON.stringify(hebergement),
      declarationId,
    ],
  );

  if (depot8jStatut) {
    await getPool().query(
      `UPDATE front.demande_sejour
       SET statut = $1,
           declaration_2m = $2::jsonb
       WHERE id = $3`,
      [
        depot8jStatut,
        JSON.stringify({ attestation: { at: "2020-06-15" } }),
        declarationId,
      ],
    );
  }
};
