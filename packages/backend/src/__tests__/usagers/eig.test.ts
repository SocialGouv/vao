import { AGREMENT_STATUT } from "@vao/shared-bridge";
import dayjs from "dayjs";
import request from "supertest";

import { UpdateTypes } from "../../helpers/eig";
import { roles } from "../../helpers/users";
import { mailService } from "../../services/mail";
import { createAgrement } from "../helpers/agrementsHelper";
import { getFoAppHelper } from "../helpers/appHelper";
import { createDemandeSejour } from "../helpers/demandeSejourHelper";
import { createEig } from "../helpers/eigHelper";
import { createHebergement } from "../helpers/hebergementHelper";
import { createOrganisme } from "../helpers/organismeHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import {
  createAdminUserValide,
  createUsagersUserValide,
} from "../helpers/userHelper";

jest.mock("../../services/mail", () => ({
  mailService: { send: jest.fn() },
}));

let foUserId = 0;
const getEigFoUser = () => ({
  id: foUserId,
  roles: [roles.EIG_LECTURE, roles.EIG_ECRITURE],
  territoireCode: "FRA",
});
let declarationId = 0;
let organismeId = 0;

beforeAll(async () => {
  await createTestContainer();
  const foUser = await createUsagersUserValide({
    roles: [roles.EIG_LECTURE, roles.EIG_ECRITURE],
  });

  foUserId = foUser.id;

  organismeId = await createOrganisme({ userId: foUserId });
  await createAgrement({
    agrement: {
      regionObtention: "IDF",
      statut: AGREMENT_STATUT.VALIDE,
    },
    organismeId,
  });
  declarationId = await createDemandeSejour({
    departementSuivi: "75",
    organismeId,
    statut: "SEJOUR EN COURS",
  });
  await createHebergement({ declarationId, organismeId });
  const stamp = Date.now();
  await createAdminUserValide({
    email: `eig-ddets-${stamp}@example.com`,
    roles: [roles.EIG],
    ter_code: "75",
  });
  await createAdminUserValide({
    email: `eig-dreets-${stamp}@example.com`,
    roles: [roles.EIG],
    ter_code: "IDF",
  });
});

afterAll(async () => {
  await removeTestContainer();
});

beforeEach(() => {
  jest.clearAllMocks();
  (mailService.send as jest.Mock).mockResolvedValue(undefined);
});

describe("Domaine /eig", () => {
  describe("GET /eig/me", () => {
    it("retourne 200 avec des EIG", async () => {
      await createEig({ declarationId, userId: foUserId });

      const response = await request(
        getFoAppHelper({
          id: foUserId,
          roles: [
            roles.EIG_LECTURE,
            roles.EIG_ECRITURE,
            roles.DEMANDE_SEJOUR_LECTURE,
            roles.DEMANDE_SEJOUR_ECRITURE,
          ],
          territoireCode: "FRA",
        }),
      )
        .get("/eig/me")
        .query({
          limit: 10,
          offset: 0,
          search: "{}",
          sortBy: "id",
          sortDirection: "ASC",
        });

      expect(response.status).toBe(200);
      expect(response.body.eig?.eigs).toBeInstanceOf(Array);
      expect(response.body.eig?.eigs?.length).toBeGreaterThan(0);
    });

    it("retourne 400 quand la query est invalide", async () => {
      const response = await request(getFoAppHelper(getEigFoUser()))
        .get("/eig/me")
        .query({
          sortDirection: "INVALID",
        });

      expect(response.status).toBe(400);
      expect(response.body.name).toBe("INVALID_QUERY");
    });
  });

  describe("GET /eig/ds/:declarationId", () => {
    it("retourne 200 avec la liste des EIG pour la déclaration", async () => {
      await createEig({ declarationId, userId: foUserId });

      const response = await request(getFoAppHelper(getEigFoUser())).get(
        `/eig/ds/${declarationId}`,
      );
      expect(response.status).toBe(200);
      expect(response.body.eigs).toBeInstanceOf(Array);
    });
  });

  describe("GET /eig/available-ds", () => {
    it("retourne 200 avec un tableau vide sans paramètre search", async () => {
      const response = await request(getFoAppHelper(getEigFoUser())).get(
        "/eig/available-ds",
      );
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("retourne 200 avec des déclarations quand search est fourni", async () => {
      await createEig({ declarationId, userId: foUserId });

      const response = await request(getFoAppHelper(getEigFoUser()))
        .get("/eig/available-ds")
        .query({
          search: "TSTMSG",
        });
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
    });
  });

  describe("GET /eig/:id", () => {
    it("retourne 200 avec le détail EIG enrichi", async () => {
      const eigId = await createEig({ declarationId, userId: foUserId });
      const response = await request(getFoAppHelper(getEigFoUser())).get(
        `/eig/${eigId}`,
      );
      expect(response.status).toBe(200);
      expect(response.body.eig.id).toBe(eigId);
    });
  });

  describe("POST /eig", () => {
    it("retourne 400 quand declarationId est absent du payload", async () => {
      const response = await request(getFoAppHelper(getEigFoUser()))
        .post("/eig")
        .send({
          parametre: {},
        });
      expect(response.status).toBe(400);
    });

    it("retourne 200 et crée un EIG", async () => {
      const response = await request(getFoAppHelper(getEigFoUser()))
        .post("/eig")
        .send({
          parametre: {
            date: new Date().toISOString().slice(0, 10),
            declarationId,
            departement: "75",
          },
        });
      expect(response.status).toBe(200);
      expect(response.body.id).toBeDefined();
    });
  });

  describe("PUT /eig/:id", () => {
    it("retourne 400 quand le payload est invalide", async () => {
      const eigId = await createEig({ declarationId, userId: foUserId });
      const response = await request(getFoAppHelper(getEigFoUser()))
        .put(`/eig/${eigId}`)
        .send({
          parametre: { date: "2020-01-01" },
          type: "DECLARATION_SEJOUR",
        });
      expect(response.status).toBe(400);
      expect(response.body.name).toBe("ValidationError");
    });

    it("retourne 200 lors de la mise a jour des renseignements généraux", async () => {
      const eigId = await createEig({ declarationId, userId: foUserId });
      const payload = {
        deroulement:
          "Déroulement détaillé de l'événement pour satisfaire la longueur minimale.",
        dispositionInformations:
          "Les familles ont été informées selon le protocole en vigueur.",
        dispositionRemediation:
          "Actions correctives immédiates et suivi post-incident.",
        dispositionVictimes:
          "Victimes prises en charge et orientées vers les services adaptés.",
        personnel: [
          {
            competence: "Secourisme niveau 1",
            dateNaissance: "1990-05-15",
            listeFonction: ["restauration"],
            nom: "Dupont",
            prenom: "Jean",
            telephone: "0102030405",
          },
        ],
      };
      const response = await request(getFoAppHelper(getEigFoUser()))
        .put(`/eig/${eigId}`)
        .send({
          parametre: payload,
          type: UpdateTypes.RENSEIGNEMENT_GENERAUX,
        });
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(eigId);
      expect(response.body.userId).toBe(foUserId);

      const getResponse = await request(getFoAppHelper(getEigFoUser())).get(
        `/eig/${eigId}`,
      );
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.eig.deroulement).toBe(payload.deroulement);
      expect(getResponse.body.eig.dispositionInformations).toBe(
        payload.dispositionInformations,
      );
      expect(getResponse.body.eig.dispositionRemediation).toBe(
        payload.dispositionRemediation,
      );
      expect(getResponse.body.eig.dispositionVictimes).toBe(
        payload.dispositionVictimes,
      );
      expect(getResponse.body.eig.personnel).toBeInstanceOf(Array);
      expect(getResponse.body.eig.personnel[0].competence).toBe(
        payload.personnel[0].competence,
      );
      expect(getResponse.body.eig.personnel[0].listeFonction).toEqual(
        payload.personnel[0].listeFonction,
      );
      expect(getResponse.body.eig.personnel[0].nom).toBe(
        payload.personnel[0].nom,
      );
      expect(getResponse.body.eig.personnel[0].prenom).toBe(
        payload.personnel[0].prenom,
      );
      expect(getResponse.body.eig.personnel[0].telephone).toBe(
        payload.personnel[0].telephone,
      );
    });

    it("retourne 200 lors de la mise a jour de la sélection de déclaration", async () => {
      const eigId = await createEig({ declarationId, userId: foUserId });
      const response = await request(getFoAppHelper(getEigFoUser()))
        .put(`/eig/${eigId}`)
        .send({
          parametre: {
            date: new Date().toISOString().slice(0, 10),
            declarationId,
            departement: "75",
          },
          type: UpdateTypes.DECLARATION_SEJOUR,
        });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(eigId);
    });

    it("retourne 200 lors de la mise a jour du type d'événement", async () => {
      const eigId = await createEig({ declarationId, userId: foUserId });
      const response = await request(getFoAppHelper(getEigFoUser()))
        .put(`/eig/${eigId}`)
        .send({
          parametre: {
            types: ["VIOLENCES_PHYSIQUES"],
          },
          type: UpdateTypes.TYPE_EVENEMENT,
        });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(String(eigId));
    });

    it("retourne 200 lors de la mise a jour des emails autres destinataires", async () => {
      const eigId = await createEig({ declarationId, userId: foUserId });
      const response = await request(getFoAppHelper(getEigFoUser()))
        .put(`/eig/${eigId}`)
        .send({
          parametre: {
            emailAutresDestinataires: ["copie@example.com"],
          },
          type: UpdateTypes.EMAIL_AUTRES_DESTINATAIRES,
        });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(eigId);
    });

    it("retourne 200 lors de la mise a jour du fichier", async () => {
      const eigId = await createEig({ declarationId, userId: foUserId });
      const response = await request(getFoAppHelper(getEigFoUser()))
        .put(`/eig/${eigId}`)
        .send({
          parametre: {
            file: {
              createdAt: new Date().toISOString(),
              name: "piece-jointe-eig.pdf",
              uuid: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
            },
          },
          type: UpdateTypes.FILE,
        });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(eigId);
    });
  });

  describe("POST /eig/depose/:id", () => {
    it("retourne 400 quand l'EIG est incomplet", async () => {
      const eigId = await createEig({ declarationId, userId: foUserId });
      const response = await request(getFoAppHelper(getEigFoUser()))
        .post(`/eig/depose/${eigId}`)
        .send({});
      expect(response.status).toBe(400);
      expect(response.body.name).toBe("ValidationError");
    });

    it("retourne 200 quand l'EIG est complet et déposable", async () => {
      const eigId = await createEig({ declarationId, userId: foUserId });

      const preview = await request(getFoAppHelper(getEigFoUser())).get(
        `/eig/${eigId}`,
      );
      expect(preview.status).toBe(200);
      const jourDeclaration = dayjs(preview.body.eig.dateDebut).format(
        "YYYY-MM-DD",
      );

      const putDeclaration = await request(getFoAppHelper(getEigFoUser()))
        .put(`/eig/${eigId}`)
        .send({
          parametre: {
            date: jourDeclaration,
            declarationId,
            departement: "75",
          },
          type: UpdateTypes.DECLARATION_SEJOUR,
        });
      expect(putDeclaration.status).toBe(200);

      const putTypes = await request(getFoAppHelper(getEigFoUser()))
        .put(`/eig/${eigId}`)
        .send({
          parametre: {
            types: ["VIOLENCES_PHYSIQUES"],
          },
          type: UpdateTypes.TYPE_EVENEMENT,
        });
      expect(putTypes.status).toBe(200);

      const renseignements = {
        deroulement:
          "Déroulement détaillé de l'événement pour satisfaire la longueur minimale.",
        dispositionInformations:
          "Les familles ont été informées selon le protocole en vigueur.",
        dispositionRemediation:
          "Actions correctives immédiates et suivi post-incident.",
        dispositionVictimes:
          "Victimes prises en charge et orientées vers les services adaptés.",
        personnel: [
          {
            competence: "Secourisme niveau 1",
            dateNaissance: "1990-05-15",
            listeFonction: ["restauration"],
            nom: "Dupont",
            prenom: "Jean",
            telephone: "0102030405",
          },
        ],
      };

      const putRenseignements = await request(getFoAppHelper(getEigFoUser()))
        .put(`/eig/${eigId}`)
        .send({
          parametre: renseignements,
          type: UpdateTypes.RENSEIGNEMENT_GENERAUX,
        });
      expect(putRenseignements.status).toBe(200);

      const putAutresDestinataires = await request(
        getFoAppHelper(getEigFoUser()),
      )
        .put(`/eig/${eigId}`)
        .send({
          parametre: {
            emailAutresDestinataires: ["copie-eig@example.com"],
          },
          type: UpdateTypes.EMAIL_AUTRES_DESTINATAIRES,
        });
      expect(putAutresDestinataires.status).toBe(200);

      const response = await request(getFoAppHelper(getEigFoUser()))
        .post(`/eig/depose/${eigId}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(String(eigId));
      expect(mailService.send).toHaveBeenCalled();
      const subjects = (mailService.send as jest.Mock).mock.calls.map(
        ([payload]: [{ subject: string }]) => payload.subject,
      );
      expect(
        subjects.some((subject) => subject.includes("Evènement indésirable")),
      ).toBe(true);
      expect(
        subjects.filter((subject) =>
          subject.includes("Evènement indésirable grave"),
        ).length,
      ).toBeGreaterThanOrEqual(2);
      const autreDestinataireMail = (
        mailService.send as jest.Mock
      ).mock.calls.find(([payload]: [{ to: string | string[] }]) => {
        if (Array.isArray(payload.to)) {
          return payload.to.includes("copie-eig@example.com");
        }
        return payload.to === "copie-eig@example.com";
      });
      expect(autreDestinataireMail).toBeDefined();
    });
  });

  describe("DELETE /eig/:id", () => {
    it("retourne 200 et supprime l'EIG", async () => {
      const eigId = await createEig({ declarationId, userId: foUserId });
      const response = await request(getFoAppHelper(getEigFoUser())).delete(
        `/eig/${eigId}`,
      );
      expect(response.status).toBe(200);
      expect(response.body.eig).toBe(String(eigId));
    });
  });
});
