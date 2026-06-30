import { DEMANDE_SEJOUR_STATUTS, STATUS_USER_FRONT } from "@vao/shared-bridge";
import request from "supertest";

import { roles } from "../../helpers/users";
import DemandeSejour from "../../services/DemandeSejour";
import { mailService } from "../../services/mail";
import { getPool } from "../../utils/pgpool";
import { AppHelperUser, getBoAppHelper } from "../helpers/appHelper";
import { createDemandeSejour } from "../helpers/demandeSejourHelper";
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

let boUser: AppHelperUser;
let organismeId: number;
let declarationId: number;

beforeAll(async () => {
  await createTestContainer();
  const foUser = await createUsagersUserValide();
  await getPool().query(
    `UPDATE front.users SET status_code = $1 WHERE id = $2`,
    [STATUS_USER_FRONT.VALIDATED, foUser.id],
  );
  boUser = await createAdminUserValide({
    roles: [roles.DEMANDE_SEJOUR_LECTURE, roles.DEMANDE_SEJOUR_ECRITURE],
    territoireCode: "FRA",
  });
  organismeId = await createOrganisme({ userId: foUser.id });
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

describe("Domaine /sejour (admin)", () => {
  describe("GET /sejour/admin", () => {
    it("retourne 200 avec la liste des demandes", async () => {
      const response = await request(getBoAppHelper(boUser))
        .get("/sejour/admin")
        .query({
          search: {
            organismeId,
          },
        });

      expect(response.status).toBe(200);
    });
  });

  describe("GET /sejour/admin/messages", () => {
    it("retourne 200 avec les messages", async () => {
      const response = await request(getBoAppHelper(boUser)).get(
        "/sejour/admin/messages",
      );
      expect(response.status).toBe(200);
    });
  });

  describe("GET /sejour/admin/extract", () => {
    it("retourne 200 avec un CSV", async () => {
      const response = await request(getBoAppHelper(boUser)).get(
        "/sejour/admin/extract",
      );
      expect(response.status).toBe(200);
    });

    it("retourne 500 quand l'extraction échoue", async () => {
      const extractSpy = jest
        .spyOn(DemandeSejour, "getExtract")
        .mockRejectedValueOnce(new Error("extract failed"));

      const response = await request(getBoAppHelper(boUser)).get(
        "/sejour/admin/extract",
      );

      expect(response.status).toBe(500);
      extractSpy.mockRestore();
    });
  });

  describe("GET /sejour/admin/extract-hebergement", () => {
    it("retourne 200 avec un CSV", async () => {
      const response = await request(getBoAppHelper(boUser)).get(
        "/sejour/admin/extract-hebergement",
      );
      expect(response.status).toBe(200);
    });

    it("retourne 500 quand l'extraction hebergement échoue", async () => {
      const hebergementSpy = jest
        .spyOn(DemandeSejour, "getHebergementsByDepartementCode")
        .mockRejectedValueOnce(new Error("extract hebergement failed"));

      const response = await request(getBoAppHelper(boUser)).get(
        "/sejour/admin/extract-hebergement",
      );

      expect(response.status).toBe(500);
      hebergementSpy.mockRestore();
    });
  });

  describe("GET /sejour/admin/hebergements", () => {
    it("retourne 200 avec la liste des hebergements", async () => {
      const response = await request(getBoAppHelper(boUser)).get(
        "/sejour/admin/hebergements",
      );
      expect(response.status).toBe(200);
    });
  });

  describe("GET /sejour/admin/historique/:declarationId", () => {
    it("retourne 200 avec l'historique de la declaration", async () => {
      const response = await request(getBoAppHelper(boUser)).get(
        `/sejour/admin/historique/${declarationId}`,
      );
      expect(response.status).toBe(200);
    });
  });

  describe("GET /sejour/admin/stats", () => {
    it("retourne 200 avec les stats admin", async () => {
      const response = await request(getBoAppHelper(boUser)).get(
        "/sejour/admin/stats",
      );
      expect(response.status).toBe(200);
    });
  });

  describe("GET /sejour/admin/:declarationId", () => {
    it("retourne 200 avec la declaration", async () => {
      const response = await request(getBoAppHelper(boUser)).get(
        `/sejour/admin/${declarationId}`,
      );
      expect(response.status).toBe(200);
    });
  });

  describe("POST /sejour/admin/:declarationId/prise-en-charge", () => {
    it("retourne 400 quand le statut ne permet pas la prise en charge", async () => {
      const response = await request(getBoAppHelper(boUser))
        .post(`/sejour/admin/${declarationId}/prise-en-charge`)
        .send({});
      expect(response.status).toBe(400);
    });
  });

  describe("POST /sejour/admin/:declarationId/demande-complements", () => {
    it("retourne 400 quand le statut ne permet pas la demande de complements", async () => {
      const response = await request(getBoAppHelper(boUser))
        .post(`/sejour/admin/${declarationId}/demande-complements`)
        .send({});
      expect(response.status).toBe(400);
    });
  });

  describe("POST /sejour/admin/:declarationId/refus", () => {
    it("retourne 400 quand le statut ne permet pas le refus", async () => {
      const response = await request(getBoAppHelper(boUser))
        .post(`/sejour/admin/${declarationId}/refus`)
        .send({});
      expect(response.status).toBe(400);
    });
  });

  describe("POST /sejour/admin/:declarationId/enregistrement-2-mois", () => {
    it("retourne 400 quand le statut ne permet pas l'enregistrement 2 mois", async () => {
      const response = await request(getBoAppHelper(boUser))
        .post(`/sejour/admin/${declarationId}/enregistrement-2-mois`)
        .send({});
      expect(response.status).toBe(400);
    });
  });

  describe("Cas avancés (routes admin)", () => {
    describe("POST /sejour/admin/:declarationId/prise-en-charge avec TRANSMISE", () => {
      it("retourne 200 et passe la déclaration EN_COURS", async () => {
        const dsId = await createDemandeSejour({
          idFonctionnelle: "TST-PEC-OK",
          libelle: "PEC OK",
          organismeId,
          statut: "TRANSMISE",
        });
        await createHebergement({ declarationId: dsId, organismeId });

        const response = await request(getBoAppHelper(boUser))
          .post(`/sejour/admin/${dsId}/prise-en-charge`)
          .send({});

        expect(response.status).toBe(200);
      });
    });

    describe("POST /sejour/admin/:declarationId/demande-complements avec EN_COURS", () => {
      it("retourne 200 et passe la déclaration A_MODIFIER", async () => {
        const dsId = await createDemandeSejour({
          idFonctionnelle: "TST-COMP-OK",
          libelle: "Compl OK",
          organismeId,
          statut: "EN COURS",
        });
        await createHebergement({ declarationId: dsId, organismeId });

        const response = await request(getBoAppHelper(boUser))
          .post(`/sejour/admin/${dsId}/demande-complements`)
          .send({ commentaire: "Merci de fournir des compléments" });

        expect(response.status).toBe(200);
        expect(mailService.send).toHaveBeenCalledTimes(1);
        const mailPayload = (mailService.send as jest.Mock).mock.calls[0][0];
        expect(mailPayload.subject).toContain("complément");
      });
    });

    describe("POST /sejour/admin/:declarationId/refus avec EN_COURS", () => {
      it("retourne 200 et passe la déclaration REFUSEE", async () => {
        const dsId = await createDemandeSejour({
          idFonctionnelle: "TST-REF-OK",
          libelle: "Refus OK",
          organismeId,
          statut: "EN COURS",
        });
        await createHebergement({ declarationId: dsId, organismeId });

        const response = await request(getBoAppHelper(boUser))
          .post(`/sejour/admin/${dsId}/refus`)
          .send({ commentaire: "Refus motivé" });

        expect(response.status).toBe(200);
        expect(mailService.send).toHaveBeenCalledTimes(1);
        const mailPayload = (mailService.send as jest.Mock).mock.calls[0][0];
        expect(mailPayload.subject).toContain("TST-REF-OK");
      });
    });

    describe("POST /sejour/admin/:declarationId/refus sans déclaration", () => {
      it("retourne 403 quand la déclaration n'existe pas (permission refusée)", async () => {
        const response = await request(getBoAppHelper(boUser))
          .post("/sejour/admin/999999/refus")
          .send({ commentaire: "Refus" });
        expect(response.status).toBe(403);
      });
    });

    describe("GET /sejour/admin/:declarationId avec id inexistant", () => {
      it("retourne 403 quand la déclaration n'existe pas (permission refusée)", async () => {
        const response = await request(getBoAppHelper(boUser)).get(
          "/sejour/admin/999999",
        );
        expect(response.status).toBe(403);
      });
    });

    describe("POST /sejour/admin/:declarationId/enregistrement-2-mois (succès)", () => {
      const organismeAvecAgrement = {
        agrement: { dateObtention: "2020-06-15" },
        personnePhysique: { nom: "Org AR test" },
        typeOrganisme: "personne_physique",
      };
      const attestationJson = {
        at: "2025-03-01",
        by: { nom: "Doe", prenom: "John" },
      };

      it("retourne 200 et envoie l'accusé de réception 2 mois", async () => {
        const dsId = await createDemandeSejour({
          departementSuivi: "75",
          idFonctionnelle: "TST-ENR-2M-OK",
          libelle: "Enregistrement 2 mois OK",
          organismeId,
          statut: DEMANDE_SEJOUR_STATUTS.EN_COURS,
        });
        await createHebergement({ declarationId: dsId, organismeId });
        await getPool().query(
          `UPDATE front.demande_sejour
           SET organisme = $1::jsonb, attestation = $2::jsonb
           WHERE id = $3`,
          [
            JSON.stringify(organismeAvecAgrement),
            JSON.stringify(attestationJson),
            dsId,
          ],
        );

        const response = await request(getBoAppHelper(boUser))
          .post(`/sejour/admin/${dsId}/enregistrement-2-mois`)
          .send({});

        expect(response.status).toBe(200);
        expect(mailService.send).toHaveBeenCalled();
        const subjects = (mailService.send as jest.Mock).mock.calls.map(
          ([payload]: [{ subject: string }]) => payload.subject,
        );
        expect(
          subjects.some((subject) => subject.includes("Enregistrement")),
        ).toBe(true);
      });

      it("retourne 200 et envoie l'accusé de réception 8 jours", async () => {
        const dsId = await createDemandeSejour({
          departementSuivi: "75",
          idFonctionnelle: "TST-ENR-8J-OK",
          libelle: "Enregistrement 8 jours OK",
          organismeId,
          statut: DEMANDE_SEJOUR_STATUTS.EN_COURS_8J,
        });
        await createHebergement({ declarationId: dsId, organismeId });
        await getPool().query(
          `UPDATE front.demande_sejour
           SET organisme = $1::jsonb, attestation = $2::jsonb
           WHERE id = $3`,
          [
            JSON.stringify(organismeAvecAgrement),
            JSON.stringify(attestationJson),
            dsId,
          ],
        );

        const response = await request(getBoAppHelper(boUser))
          .post(`/sejour/admin/${dsId}/enregistrement-2-mois`)
          .send({});

        expect(response.status).toBe(200);
        expect(mailService.send).toHaveBeenCalled();
        const subjects = (mailService.send as jest.Mock).mock.calls.map(
          ([payload]: [{ subject: string }]) => payload.subject,
        );
        expect(
          subjects.some((subject) => subject.includes("Enregistrement")),
        ).toBe(true);
      });
    });

    describe("POST /sejour/admin/:declarationId/prise-en-charge sur statut déjà en cours", () => {
      it("retourne 400 quand la déclaration est déjà EN COURS", async () => {
        const dsId = await createDemandeSejour({
          idFonctionnelle: "TST-PEC-DEJA",
          libelle: "PEC deja en cours",
          organismeId,
          statut: "EN COURS",
        });
        await createHebergement({ declarationId: dsId, organismeId });

        const response = await request(getBoAppHelper(boUser))
          .post(`/sejour/admin/${dsId}/prise-en-charge`)
          .send({});

        expect(response.status).toBe(400);
      });
    });
  });
});
