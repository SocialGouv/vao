import {
  AGREMENT_STATUT,
  FILE_CATEGORY,
  TRANCHE_AGE,
  TYPE_HANDICAP,
} from "@vao/shared-bridge";
import { randomUUID } from "crypto";
import request from "supertest";

import app from "../../app";
import { createAdresse } from "../helper/fixtures/adresseHelper";
import {
  //createAgrement,
  createAgrementDeprecated,
} from "../helper/fixtures/agrementsHelper";
import { createOrganisme } from "../helper/fixtures/organismeHelper";
import { createUsagersUser } from "../helper/fixtures/userHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helper/testContainer";

let authUser = { id: 1, role: "admin" };

jest.mock("../../middlewares/common/checkJWT", () => {
  return async (req, res, next) => {
    req.decoded = authUser;
    next();
  };
});

beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});

describe("GET /agrements/organisme/:id", () => {
  it("devrait retourner un agrément par ID de l'organisme avec succès", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementId = await createAgrementDeprecated({ organismeId });
    const response = await request(app).get(
      `/agrements/organisme/${organismeId}`,
    );

    // Vérification des résultats
    expect(response.status).toBe(200);
    expect(response.body.agrement).not.toBeNull();
    expect(response.body.agrement.id).toEqual(agrementId);
  });
});

describe("POST /agrements/", () => {
  it("devrait créer un agrément", async () => {
    authUser = await createUsagersUser();
    const adresseId = await createAdresse();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const activiteId = Math.floor(Math.random() * 20) + 1;
    const agrementTest = {
      accompRespAttestHono: true,
      accompRespCompExp: "Oui",
      accompRespNb: 1,
      accompRespRecruteUrg: "Non",
      agrementAnimation: [
        {
          activiteId: activiteId,
        },
        {
          activiteId: `${21 - activiteId}`,
        },
      ],
      agrementBilanAnnuel: [
        {
          annee: 2024,
          bilanHebergement: {
            adresseId: adresseId,
            mois: [6, 7],
            nbJours: 140,
            nomHebergement: "Centre de vacances Test",
          },
          nbFemmes: 10,
          nbGlobalVacanciers: 20,
          nbHommes: 10,
          nbTotalJoursVacances: 140,
          trancheAge: [TRANCHE_AGE.TA_18_39, TRANCHE_AGE.TA_40_59],
          typeHandicap: [TYPE_HANDICAP.MOTEUR, TYPE_HANDICAP.COGNITIF],
        },
      ],
      agrementFiles: [
        {
          category: FILE_CATEGORY.MOTIVATION,
          fileUuid: randomUUID(),
        },
        {
          category: FILE_CATEGORY.IMMATRICUL,
          fileUuid: randomUUID(),
        },
      ],
      agrementSejours: [
        {
          adresseId: adresseId,
          mois: [5, 11],
          nbVacanciers: 10,
          nomHebergement: "Centre de vacances Test",
        },
      ],
      animationAutre: "Atelier peinture",
      bilanAucunChangementEvolution: false,
      bilanChangementEvolution: true,
      bilanFinancierCommentaire: "Commentaire financier",
      bilanFinancierComparatif: "Comparatif OK",
      bilanFinancierComptabilite: "Comptabilité OK",
      bilanFinancierRessourcesHumaines: "Ressources OK",
      bilanQualElementsMarquants: "Éléments marquants",
      bilanQualPerceptionSensibilite: "Sensibilité OK",
      bilanQualPerspectiveEvol: "Perspectives OK",
      budgetComplement: "Complément OK",
      budgetGestionPerso: "Gestion perso OK",
      budgetPaiementSecurise: "Paiement OK",
      commentaire: "Commentaire de test",
      dateConfirmCompletude: new Date("2024-12-07"),
      dateDepot: new Date("2024-12-01"),
      dateObtentionCertificat: new Date("2025-01-15"),
      dateVerifCompleture: new Date("2024-12-05"),
      immatriculation: "123-AB-456",
      motivations: "Motivation de test",
      organismeId,
      protocoleEvacUrg: "Procédure OK",
      protocoleInfoFamille: "Information envoyée",
      protocoleMateriel: "Matériel complet",
      protocoleRapatEtranger: "Procédure OK",
      protocoleRapatUrg: "Procédure OK",
      protocoleRemboursement: "Remboursement OK",
      //sejourCommentaire: "Séjour test",
      sejourNbEnvisage: 2,
      statut: AGREMENT_STATUT.BROUILLON,
      //statut: AGREMENT_STATUT.DEPOSE,
      suiviMedAccordSejour: "Oui",
      suiviMedDistribution: "Oui",
      transportAllerRetour: "Bus",
      transportSejour: "Train",
      updatedAt: new Date(),
      vacanciersNbEnvisage: 10,
    };

    const response = await request(app).post(`/agrements/`).send(agrementTest);

    // Vérification des résultats
    expect(response.status).toBe(200);
  });
});
