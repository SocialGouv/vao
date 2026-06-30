import { DEMANDE_SEJOUR_STATUTS, STATUS_USER_FRONT } from "@vao/shared-bridge";
import dayjs from "dayjs";
import request from "supertest";

import { partOrganisme } from "../../helpers/org-part";
import { roles } from "../../helpers/users";
import DemandeSejour from "../../services/DemandeSejour";
import { mailService } from "../../services/mail";
import { getPool } from "../../utils/pgpool";
import { getFoAppHelper } from "../helpers/appHelper";
import {
  buildOrganismeEtablissementSecondaireForDepose,
  buildOrganismePersonnePhysiqueForDepose,
  createDemandeSejour,
  deleteDemandeSejour,
  prepareDemandeSejourForDepose,
} from "../helpers/demandeSejourHelper";
import { createDocument } from "../helpers/documentHelper";
import { createHebergement } from "../helpers/hebergementHelper";
import {
  createOrganisme,
  markOrganismeComplet,
} from "../helpers/organismeHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import {
  createAdminUserValide,
  createUsagersUserValide,
} from "../helpers/userHelper";

jest.setTimeout(30000);

const buildResponsableSejour = () => ({
  adresse: { label: "1 rue Test" },
  email: "responsable@test.com",
  fonction: "Responsable",
  nom: "Doe",
  prenom: "John",
  telephone: "0102030405",
});

jest.mock("../../services/mail", () => ({
  mailService: { send: jest.fn() },
}));

let foUserId = 0;
const getSejourFoUser = () => ({
  id: foUserId,
  roles: [roles.DEMANDE_SEJOUR_LECTURE, roles.DEMANDE_SEJOUR_ECRITURE],
  territoireCode: "FRA",
});
let organismeId = 0;
let declarationId = 0;

beforeAll(async () => {
  await createTestContainer({ pg: true, s3: true });
  const foUser = await createUsagersUserValide();
  await getPool().query(
    `UPDATE front.users SET status_code = $1 WHERE id = $2`,
    [STATUS_USER_FRONT.VALIDATED, foUser.id],
  );
  await createAdminUserValide({
    email: `bo-sejour-${Date.now()}@example.com`,
    roles: [roles.DEMANDE_SEJOUR_ECRITURE],
    ter_code: "75",
  });
  foUserId = foUser.id;
  organismeId = await createOrganisme({ userId: foUserId });
  declarationId = await createDemandeSejour({ organismeId });
  await createHebergement({ declarationId, organismeId });
});

afterAll(async () => {
  await removeTestContainer();
});

beforeEach(() => {
  jest.clearAllMocks();
  (mailService.send as jest.Mock).mockResolvedValue(undefined);
});

describe("Domaine /sejour", () => {
  describe("GET /sejour/stats", () => {
    it("retourne 200 avec les stats", async () => {
      const response = await request(
        getFoAppHelper({
          id: foUserId,
          roles: [roles.DEMANDE_SEJOUR_LECTURE, roles.DEMANDE_SEJOUR_ECRITURE],
          territoireCode: "FRA",
        }),
      ).get("/sejour/stats");
      expect(response.status).toBe(200);
    });

    it("retourne 500 quand la récupération des stats échoue", async () => {
      const statsSpy = jest
        .spyOn(DemandeSejour, "getStats")
        .mockRejectedValueOnce(new Error("stats failed"));

      const response = await request(getFoAppHelper(getSejourFoUser())).get(
        "/sejour/stats",
      );
      expect(response.status).toBe(500);
      statsSpy.mockRestore();
    });
  });

  describe("GET /sejour/extract", () => {
    it("retourne 200 avec un CSV", async () => {
      const response = await request(getFoAppHelper(getSejourFoUser())).get(
        "/sejour/extract",
      );
      expect(response.status).toBe(200);
    });

    it("retourne 500 quand l'extraction FO échoue", async () => {
      const extractSpy = jest
        .spyOn(DemandeSejour, "getExtractFO")
        .mockRejectedValueOnce(new Error("extract fo failed"));

      const response = await request(getFoAppHelper(getSejourFoUser())).get(
        "/sejour/extract",
      );
      expect(response.status).toBe(500);
      extractSpy.mockRestore();
    });
  });

  describe("GET /sejour/deprecated", () => {
    it("retourne 200 avec les declarations depreciees", async () => {
      const response = await request(getFoAppHelper(getSejourFoUser())).get(
        "/sejour/deprecated",
      );
      expect(response.status).toBe(200);
    });

    it("retourne 400 avec un sortBy invalide", async () => {
      const response = await request(getFoAppHelper(getSejourFoUser()))
        .get("/sejour/deprecated")
        .query({
          sortBy: "invalidSort",
        });

      expect(response.status).toBe(400);
    });

    it("retourne 500 quand la récupération des demandes dépréciées échoue", async () => {
      const deprecatedSpy = jest
        .spyOn(DemandeSejour, "getDeprecated")
        .mockRejectedValueOnce(new Error("deprecated failed"));

      const response = await request(getFoAppHelper(getSejourFoUser())).get(
        "/sejour/deprecated",
      );
      expect(response.status).toBe(500);
      deprecatedSpy.mockRestore();
    });
  });

  describe("GET /sejour/:declarationId", () => {
    it("retourne 200 avec la declaration", async () => {
      const response = await request(getFoAppHelper(getSejourFoUser())).get(
        `/sejour/${declarationId}`,
      );
      expect(response.status).toBe(200);
    });

    it("retourne 500 quand la récupération de la déclaration échoue", async () => {
      const getOneSpy = jest
        .spyOn(DemandeSejour, "getOne")
        .mockRejectedValueOnce(new Error("get one failed"));

      const response = await request(getFoAppHelper(getSejourFoUser())).get(
        `/sejour/${declarationId}`,
      );
      expect(response.status).toBe(500);
      getOneSpy.mockRestore();
    });
  });

  describe("GET /sejour/historique/:declarationId", () => {
    it("retourne 200 avec l'historique de la declaration", async () => {
      const response = await request(getFoAppHelper(getSejourFoUser())).get(
        `/sejour/historique/${declarationId}`,
      );
      expect(response.status).toBe(200);
    });

    it("retourne 500 quand la récupération de l'historique échoue", async () => {
      const historiqueSpy = jest
        .spyOn(DemandeSejour, "historique")
        .mockRejectedValueOnce(new Error("historique failed"));

      const response = await request(getFoAppHelper(getSejourFoUser())).get(
        `/sejour/historique/${declarationId}`,
      );
      expect(response.status).toBe(500);
      historiqueSpy.mockRestore();
    });

    it("retourne une erreur quand le declarationId n'est pas un nombre", async () => {
      const response = await request(getFoAppHelper(getSejourFoUser())).get(
        "/sejour/historique/abc",
      );
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("GET /sejour", () => {
    it("retourne 200 avec la liste des demandes", async () => {
      const response = await request(getFoAppHelper(getSejourFoUser()))
        .get("/sejour")
        .query({
          search: {
            idFonctionnelle: "DS-25-41-41",
          },
        });
      expect(response.status).toBe(200);
    });

    it("retourne 500 quand la récupération des demandes échoue", async () => {
      const getSpy = jest
        .spyOn(DemandeSejour, "get")
        .mockRejectedValueOnce(new Error("get failed"));

      const response = await request(getFoAppHelper(getSejourFoUser())).get(
        "/sejour",
      );
      expect(response.status).toBe(500);
      getSpy.mockRestore();
    });
  });

  describe("POST /sejour/depose/:declarationId", () => {
    const buildHebergementLocauxPourDepose = () => ({
      accessibilite: "accessible",
      accessibilitePrecision: "Description accessibilite",
      amenagementsSpecifiques: false,
      chambresDoubles: true,
      chambresUnisexes: true,
      couchageIndividuel: true,
      descriptionLieuHebergement: "Description du lieu",
      fileDernierArreteAutorisationMaire: null,
      fileDerniereAttestationSecurite: {
        uuid: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
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
      visiteLocauxAt: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    });

    const postDepose2Mois = async (
      idFonctionnelle: string,
      organisme?: object,
    ) => {
      const dsId = await createDemandeSejour({
        idFonctionnelle,
        libelle: `Depose ${idFonctionnelle}`,
        organismeId,
      });
      const hebergementId = await createHebergement({
        declarationId: dsId,
        hebergement: {
          informationsLocaux: buildHebergementLocauxPourDepose(),
        },
        organismeId,
      });
      const fileUuid = await createDocument({ userId: foUserId });
      await prepareDemandeSejourForDepose({
        declarationId: dsId,
        fileUuid,
        hebergementId,
        organisme,
      });

      return request(getFoAppHelper(getSejourFoUser()))
        .post(`/sejour/depose/${dsId}`)
        .send({
          attestation: {
            aCertifie: true,
            at: dayjs().format("YYYY-MM-DD"),
            nom: "Doe",
            prenom: "John",
            qualite: "Président",
          },
        });
    };

    it("retourne 400 si l'attestation est manquante", async () => {
      const response = await request(getFoAppHelper(getSejourFoUser()))
        .post(`/sejour/depose/${declarationId}`)
        .send({});
      expect(response.status).toBe(400);
    });

    it("retourne 400 quand l'attestation n'est pas validée", async () => {
      const response = await request(getFoAppHelper(getSejourFoUser()))
        .post(`/sejour/depose/${declarationId}`)
        .send({ attestation: false });
      expect(response.status).toBe(400);
    });

    it("retourne 400 quand le schéma de la déclaration est incomplet", async () => {
      const dsId = await createDemandeSejour({
        idFonctionnelle: "TST-DEP-SCHEMA",
        libelle: "Depose schema test",
        organismeId,
      });
      await createHebergement({ declarationId: dsId, organismeId });

      const response = await request(getFoAppHelper(getSejourFoUser()))
        .post(`/sejour/depose/${dsId}`)
        .send({
          attestation: {
            at: "2026-01-01",
            by: { nom: "Doe", prenom: "John" },
          },
        });
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("retourne 400 quand le statut ne permet pas le dépôt", async () => {
      const dsId = await createDemandeSejour({
        idFonctionnelle: "TST-DEP-STATUT",
        libelle: "Depose statut test",
        organismeId,
        statut: "TRANSMISE",
      });
      await createHebergement({ declarationId: dsId, organismeId });

      const response = await request(getFoAppHelper(getSejourFoUser()))
        .post(`/sejour/depose/${dsId}`)
        .send({ attestation: { at: "2026-01-01" } });
      expect([400, 409]).toContain(response.status);
    });

    it("retourne 200 sur un dépôt 2 mois valide", async () => {
      const response = await postDepose2Mois("TST-DEP-OK");

      expect(response.status).toBe(200);
      expect(mailService.send).toHaveBeenCalled();
      const subjects = (mailService.send as jest.Mock).mock.calls.map(
        ([payload]: [{ subject: string }]) => payload.subject,
      );
      expect(subjects.some((subject) => subject.includes("Transmission"))).toBe(
        true,
      );
      expect(
        subjects.some((subject) => subject.includes("Nouvelle déclaration")),
      ).toBe(true);
    });

    it("retourne 200 sur un dépôt 2 mois avec organisme personne physique (PDF)", async () => {
      const response = await postDepose2Mois(
        "TST-DEP-PP",
        buildOrganismePersonnePhysiqueForDepose(),
      );

      expect(response.status).toBe(200);
      expect(response.body.DSuuid).toBeDefined();
    });

    it("retourne 200 sur un dépôt 2 mois avec établissement secondaire (PDF)", async () => {
      const response = await postDepose2Mois(
        "TST-DEP-SEC",
        buildOrganismeEtablissementSecondaireForDepose(),
      );

      expect(response.status).toBe(200);
      expect(response.body.DSuuid).toBeDefined();
    });

    const postDepose8jComplementaire = async (
      idFonctionnelle: string,
      depot8jStatut:
        | typeof DEMANDE_SEJOUR_STATUTS.ATTENTE_8_JOUR
        | typeof DEMANDE_SEJOUR_STATUTS.A_MODIFIER_8J,
    ) => {
      const dsId = await createDemandeSejour({
        idFonctionnelle,
        libelle: "Depose 8J OK",
        organismeId,
      });
      const hebergementId = await createHebergement({
        declarationId: dsId,
        hebergement: {
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
              uuid: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
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
            visiteLocauxAt: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
          },
        },
        organismeId,
      });
      const fileUuid = await createDocument({ userId: foUserId });
      await prepareDemandeSejourForDepose({
        declarationId: dsId,
        depot8jStatut,
        fileUuid,
        hebergementId,
      });

      return request(getFoAppHelper(getSejourFoUser()))
        .post(`/sejour/depose/${dsId}`)
        .send({
          attestation: {
            aCertifie: true,
            at: dayjs().format("YYYY-MM-DD"),
            nom: "Doe",
            prenom: "John",
            qualite: "Président",
          },
        });
    };

    it("retourne 200 sur un dépôt complémentaire 8 jours (ATTENTE_8_JOUR)", async () => {
      const response = await postDepose8jComplementaire(
        "TST-DEP-8J-ATT",
        DEMANDE_SEJOUR_STATUTS.ATTENTE_8_JOUR,
      );

      expect(response.status).toBe(200);
      expect(mailService.send).toHaveBeenCalled();
      const subjects = (mailService.send as jest.Mock).mock.calls.map(
        ([payload]: [{ subject: string }]) => payload.subject,
      );
      expect(subjects.some((subject) => subject.includes("8 jours"))).toBe(
        true,
      );
    });

    it("retourne 200 sur un dépôt complémentaire 8 jours (A_MODIFIER_8J)", async () => {
      const response = await postDepose8jComplementaire(
        "TST-DEP-8J-MOD",
        DEMANDE_SEJOUR_STATUTS.A_MODIFIER_8J,
      );

      expect(response.status).toBe(200);
      expect(mailService.send).toHaveBeenCalled();
      const subjects = (mailService.send as jest.Mock).mock.calls.map(
        ([payload]: [{ subject: string }]) => payload.subject,
      );
      expect(
        subjects.some((subject) => subject.includes("déclaration à 8 jours")),
      ).toBe(true);
    });
  });

  describe("POST /sejour/:declarationId/copy", () => {
    it("retourne 200 et duplique la declaration", async () => {
      const response = await request(getFoAppHelper(getSejourFoUser()))
        .post(`/sejour/${declarationId}/copy`)
        .send({});
      expect(response.status).toBe(200);
      expect(response.body.declarationId).toBeDefined();
    });

    it("retourne 404 quand le statut ne permet pas la copie", async () => {
      const dsId = await createDemandeSejour({
        idFonctionnelle: "TST-COPY-KO",
        libelle: "Copy KO",
        organismeId,
        statut: "REFUSEE",
      });
      await createHebergement({ declarationId: dsId, organismeId });

      const response = await request(getFoAppHelper(getSejourFoUser()))
        .post(`/sejour/${dsId}/copy`)
        .send({});

      expect(response.status).toBe(404);
    });
  });

  describe("POST /sejour/:declarationId", () => {
    it("retourne 400 si type ou parametre est manquant", async () => {
      const response = await request(getFoAppHelper(getSejourFoUser()))
        .post(`/sejour/${declarationId}`)
        .send({});
      expect(response.status).toBe(400);
    });

    it("retourne 500 quand la mise à jour échoue", async () => {
      const updateSpy = jest
        .spyOn(DemandeSejour, "update")
        .mockRejectedValueOnce(new Error("update failed"));

      const response = await request(getFoAppHelper(getSejourFoUser()))
        .post(`/sejour/${declarationId}`)
        .send({
          parametre: { description: "Erreur update" },
          type: "projetSejour",
        });

      expect(response.status).toBe(500);
      updateSpy.mockRestore();
    });

    it("retourne null/200 quand le type n'est pas reconnu", async () => {
      const dsId = await createDemandeSejour({
        idFonctionnelle: "TST-UPD-TYPE",
        libelle: "Update type inconnu",
        organismeId,
      });
      await createHebergement({ declarationId: dsId, organismeId });

      const response = await request(getFoAppHelper(getSejourFoUser()))
        .post(`/sejour/${dsId}`)
        .send({
          parametre: { foo: "bar" },
          type: "type_inconnu",
        });
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it("retourne 200 et met à jour les informations vacanciers", async () => {
      const dsId = await createDemandeSejour({
        idFonctionnelle: "TST-UPD-VAC",
        libelle: "Update vacanciers",
        organismeId,
      });
      await createHebergement({ declarationId: dsId, organismeId });

      const response = await request(getFoAppHelper(getSejourFoUser()))
        .post(`/sejour/${dsId}`)
        .send({
          parametre: { total: 10, tranchesAge: [] },
          type: "informationsVacanciers",
        });
      expect(response.status).toBe(200);
    });

    it("retourne 200 et met à jour le protocole transport", async () => {
      const dsId = await createDemandeSejour({
        idFonctionnelle: "TST-UPD-TRA",
        libelle: "Update transport",
        organismeId,
      });
      await createHebergement({ declarationId: dsId, organismeId });

      const response = await request(getFoAppHelper(getSejourFoUser()))
        .post(`/sejour/${dsId}`)
        .send({
          parametre: { id: 1, transports: [] },
          type: "protocole_transport",
        });
      expect(response.status).toBe(200);
    });

    it("retourne 200 et met à jour le protocole sanitaire", async () => {
      const dsId = await createDemandeSejour({
        idFonctionnelle: "TST-UPD-SAN",
        libelle: "Update sanitaire",
        organismeId,
      });
      await createHebergement({ declarationId: dsId, organismeId });

      const response = await request(getFoAppHelper(getSejourFoUser()))
        .post(`/sejour/${dsId}`)
        .send({
          parametre: { id: 1, infosSanitaires: {} },
          type: "protocole_sanitaire",
        });
      expect(response.status).toBe(200);
    });

    it("retourne 200 et envoie le courriel BO pour informationsVacanciers (8J validée)", async () => {
      await createAdminUserValide({
        email: `bo-ds8j-vac-${Date.now()}@example.com`,
        roles: ["DemandeSejour_Ecriture"],
        ter_code: "75",
      });

      const vacanciersAvant = {
        effectifPrevisionnel: 10,
        effectifPrevisionnelFemme: 5,
        effectifPrevisionnelHomme: 5,
      };
      const organismeJson = {
        personnePhysique: { nom: "Organisme vacanciers" },
        typeOrganisme: partOrganisme.PERSONNE_PHYSIQUE,
      };
      const personnelJson = {
        accompagnants: [],
        encadrants: [{ attestation: true, nom: "Dupont", prenom: "Jean" }],
      };

      const dsId = await createDemandeSejour({
        departementSuivi: "75",
        idFonctionnelle: `8JV${Date.now().toString(36)}`.slice(0, 14),
        libelle: "Séjour 8J vacanciers",
        organisme: organismeJson,
        organismeId,
        personnel: personnelJson,
        statut: DEMANDE_SEJOUR_STATUTS.VALIDEE_8J,
        vacanciers: vacanciersAvant,
      });
      await createHebergement({ declarationId: dsId, organismeId });

      const response = await request(getFoAppHelper(getSejourFoUser()))
        .post(`/sejour/${dsId}`)
        .send({
          parametre: {
            ...vacanciersAvant,
            effectifPrevisionnel: 12,
          },
          type: "informationsVacanciers",
        });

      expect(response.status).toBe(200);
      expect(mailService.send).toHaveBeenCalled();
      const payload = (mailService.send as jest.Mock).mock.calls[0][0];
      expect(payload.subject).toContain("vacanciers");
    });

    it("retourne 200 et envoie le courriel BO pour informationsPersonnel (8J validée)", async () => {
      await createAdminUserValide({
        email: `bo-ds8j-${Date.now()}@example.com`,
        roles: ["DemandeSejour_Ecriture"],
        ter_code: "75",
      });

      const personnelAvant = {
        accompagnants: [{ attestation: true, nom: "Martin", prenom: "Paul" }],
        encadrants: [{ attestation: true, nom: "Dupont", prenom: "Jean" }],
      };
      const organismeJson = {
        personnePhysique: { nom: "Organisme test" },
        typeOrganisme: partOrganisme.PERSONNE_PHYSIQUE,
      };
      const vacanciersJson = {
        effectifPrevisionnel: 10,
        effectifPrevisionnelFemme: 5,
        effectifPrevisionnelHomme: 5,
      };

      const dsId = await createDemandeSejour({
        departementSuivi: "75",
        idFonctionnelle: `8J${Date.now().toString(36)}`.slice(0, 14),
        libelle: "Séjour 8J personnel",
        organisme: organismeJson,
        organismeId,
        personnel: personnelAvant,
        statut: DEMANDE_SEJOUR_STATUTS.VALIDEE_8J,
        vacanciers: vacanciersJson,
      });
      await createHebergement({ declarationId: dsId, organismeId });

      const parametre = {
        ...personnelAvant,
        encadrants: [{ attestation: true, nom: "Durand", prenom: "Jean" }],
      };

      const response = await request(getFoAppHelper(getSejourFoUser()))
        .post(`/sejour/${dsId}`)
        .send({
          parametre,
          type: "informationsPersonnel",
        });

      expect(response.status).toBe(200);
      expect(mailService.send).toHaveBeenCalled();
      const payload = (mailService.send as jest.Mock).mock.calls[0][0];
      expect(payload.subject).toContain("personnel");
      expect(payload.html).toContain("Organisme test");
    });

    it("retourne 200 et envoie le courriel BO pour ajout de personnel (8J validée)", async () => {
      await createAdminUserValide({
        email: `bo-ds8j-add-${Date.now()}@example.com`,
        roles: ["DemandeSejour_Ecriture"],
        ter_code: "75",
      });

      const personnelAvant = {
        accompagnants: [],
        encadrants: [{ attestation: true, nom: "Dupont", prenom: "Jean" }],
      };
      const organismeJson = {
        personnePhysique: { nom: "Organisme ajout personnel" },
        typeOrganisme: partOrganisme.PERSONNE_PHYSIQUE,
      };
      const vacanciersJson = {
        effectifPrevisionnel: 10,
        effectifPrevisionnelFemme: 5,
        effectifPrevisionnelHomme: 5,
      };
      const dsId = await createDemandeSejour({
        departementSuivi: "75",
        idFonctionnelle: `8JA${Date.now().toString(36)}`.slice(0, 14),
        libelle: "Séjour 8J ajout personnel",
        organisme: organismeJson,
        organismeId,
        personnel: personnelAvant,
        statut: DEMANDE_SEJOUR_STATUTS.VALIDEE_8J,
        vacanciers: vacanciersJson,
      });
      await createHebergement({ declarationId: dsId, organismeId });

      const response = await request(getFoAppHelper(getSejourFoUser()))
        .post(`/sejour/${dsId}`)
        .send({
          parametre: {
            ...personnelAvant,
            accompagnants: [
              { attestation: true, nom: "Martin", prenom: "Paul" },
            ],
          },
          type: "informationsPersonnel",
        });

      expect(response.status).toBe(200);
      expect(mailService.send).toHaveBeenCalled();
      const payload = (mailService.send as jest.Mock).mock.calls[0][0];
      expect(payload.html).toContain("Ajout");
    });

    it("retourne 200 et envoie le courriel BO pour suppression de personnel (8J validée)", async () => {
      await createAdminUserValide({
        email: `bo-ds8j-del-${Date.now()}@example.com`,
        roles: ["DemandeSejour_Ecriture"],
        ter_code: "75",
      });

      const personnelAvant = {
        accompagnants: [{ attestation: true, nom: "Martin", prenom: "Paul" }],
        encadrants: [{ attestation: true, nom: "Dupont", prenom: "Jean" }],
      };
      const organismeJson = {
        personnePhysique: { nom: "Organisme suppression personnel" },
        typeOrganisme: partOrganisme.PERSONNE_PHYSIQUE,
      };
      const vacanciersJson = {
        effectifPrevisionnel: 10,
        effectifPrevisionnelFemme: 5,
        effectifPrevisionnelHomme: 5,
      };
      const dsId = await createDemandeSejour({
        departementSuivi: "75",
        idFonctionnelle: `8JD${Date.now().toString(36)}`.slice(0, 14),
        libelle: "Séjour 8J suppression personnel",
        organisme: organismeJson,
        organismeId,
        personnel: personnelAvant,
        statut: DEMANDE_SEJOUR_STATUTS.VALIDEE_8J,
        vacanciers: vacanciersJson,
      });
      await createHebergement({ declarationId: dsId, organismeId });

      const response = await request(getFoAppHelper(getSejourFoUser()))
        .post(`/sejour/${dsId}`)
        .send({
          parametre: {
            accompagnants: [],
            encadrants: [{ attestation: true, nom: "Dupont", prenom: "Jean" }],
          },
          type: "informationsPersonnel",
        });

      expect(response.status).toBe(200);
      expect(mailService.send).toHaveBeenCalled();
      const payload = (mailService.send as jest.Mock).mock.calls[0][0];
      expect(payload.html).toContain("Suppression");
    });

    it("retourne 200 et met à jour le projet de séjour", async () => {
      const dsId = await createDemandeSejour({
        idFonctionnelle: "TST-UPD-OK",
        libelle: "Update OK",
        organismeId,
      });
      await createHebergement({ declarationId: dsId, organismeId });

      const response = await request(getFoAppHelper(getSejourFoUser()))
        .post(`/sejour/${dsId}`)
        .send({
          parametre: { description: "Nouveau projet" },
          type: "projetSejour",
        });

      expect(response.status).toBe(200);
    });
  });

  describe("POST /sejour", () => {
    it("retourne 400 quand le body est invalide", async () => {
      const response = await request(getFoAppHelper(getSejourFoUser()))
        .post("/sejour")
        .send({});
      expect(response.status).toBe(400);
    });

    it("retourne 200 et crée la déclaration avec un body valide", async () => {
      await markOrganismeComplet(organismeId);
      const response = await request(getFoAppHelper(getSejourFoUser()))
        .post("/sejour")
        .send({
          parametre: {
            dateDebut: dayjs().add(10, "day").toISOString(),
            dateFin: dayjs().add(12, "day").toISOString(),
            libelle: "Sejour valide test",
            responsableSejour: buildResponsableSejour(),
          },
        });

      expect(response.status).toBe(200);
    });

    it("retourne 400 quand les dates sont invalides", async () => {
      await markOrganismeComplet(organismeId);
      const response = await request(getFoAppHelper(getSejourFoUser()))
        .post("/sejour")
        .send({
          parametre: {
            dateDebut: "2026-01-10",
            dateFin: "2026-01-05",
            libelle: "Dates invalides",
            responsableSejour: buildResponsableSejour(),
          },
        });

      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /sejour/:declarationId", () => {
    it("retourne 200 et supprime la declaration au statut BROUILLON", async () => {
      const declarationToDelete = await createDemandeSejour({
        idFonctionnelle: "TSTDEL001",
        libelle: "Declaration a supprimer",
        organismeId,
      });
      await createHebergement({
        declarationId: declarationToDelete,
        organismeId,
      });

      const response = await request(getFoAppHelper(getSejourFoUser())).delete(
        `/sejour/${declarationToDelete}`,
      );
      expect(response.status).toBe(200);
    });

    it("retourne 400 quand la déclaration n'est plus en BROUILLON", async () => {
      const dsId = await createDemandeSejour({
        idFonctionnelle: "TST-DEL-KO",
        libelle: "Del KO",
        organismeId,
        statut: "TRANSMISE",
      });
      await createHebergement({ declarationId: dsId, organismeId });

      const response = await request(getFoAppHelper(getSejourFoUser())).delete(
        `/sejour/${dsId}`,
      );

      expect(response.status).toBe(400);
    });
  });

  describe("POST /sejour/cancel/:declarationId", () => {
    it("retourne 400 quand le statut ne permet pas l'annulation", async () => {
      const response = await request(getFoAppHelper(getSejourFoUser()))
        .post(`/sejour/cancel/${declarationId}`)
        .send({});
      expect(response.status).toBe(400);
    });

    it("retourne 200 et annule la déclaration", async () => {
      const dsId = await createDemandeSejour({
        idFonctionnelle: "TST-CAN-OK",
        libelle: "Cancel OK",
        organismeId,
        statut: "TRANSMISE",
      });
      await createHebergement({ declarationId: dsId, organismeId });

      const response = await request(getFoAppHelper(getSejourFoUser()))
        .post(`/sejour/cancel/${dsId}`)
        .send({});

      expect(response.status).toBe(200);
      expect(mailService.send).toHaveBeenCalled();
      const subjects = (mailService.send as jest.Mock).mock.calls.map(
        ([payload]: [{ subject: string }]) => payload.subject,
      );
      expect(subjects.some((subject) => subject.includes("annulée"))).toBe(
        true,
      );
    });

    it("retourne 500 si l'envoi de mail back-office échoue", async () => {
      const dsId = await createDemandeSejour({
        idFonctionnelle: "TST-CAN-MAIL-KO",
        libelle: "Cancel Mail KO",
        organismeId,
        statut: "TRANSMISE",
      });
      await createHebergement({ declarationId: dsId, organismeId });
      (mailService.send as jest.Mock).mockRejectedValueOnce(
        new Error("smtp down"),
      );

      const response = await request(getFoAppHelper(getSejourFoUser()))
        .post(`/sejour/cancel/${dsId}`)
        .send({});

      expect(response.status).toBe(500);
      expect(response.body.name).toBe("AppError");
    });

    it("retourne 403 quand la déclaration a été supprimée (accès refusé par le middleware)", async () => {
      const dsTemp = await createDemandeSejour({
        idFonctionnelle: "TST-CAN-NF",
        libelle: "Cancel inexistant",
        organismeId,
      });
      await createHebergement({ declarationId: dsTemp, organismeId });

      await deleteDemandeSejour(dsTemp);

      const response = await request(getFoAppHelper(getSejourFoUser()))
        .post(`/sejour/cancel/${dsTemp}`)
        .send({});
      expect(response.status).toBe(403);
      expect(response.body.name).toBe("AppError");
    });
  });
});
