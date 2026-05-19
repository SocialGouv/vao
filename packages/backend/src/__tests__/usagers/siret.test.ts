import { ERRORS_SIRET } from "@vao/shared-bridge";
import axios from "axios";
import request from "supertest";

import { getFoAppHelper } from "../helpers/appHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";

const axiosGetMock = axios.get as jest.Mock;

beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});

beforeEach(() => {
  jest.clearAllMocks();
  axiosGetMock.mockRejectedValue({
    response: { status: 404 },
  });
});

describe("Domaine /siret", () => {
  it("GET /siret/:siret retourne 400 si le format est invalide", async () => {
    const response = await request(getFoAppHelper({ id: 1 })).get("/siret/123");

    expect(response.status).toBe(400);
  });

  it("GET /siret/:siret", async () => {
    axiosGetMock.mockRejectedValueOnce({
      response: { status: 500 },
    });
    const response = await request(getFoAppHelper()).get(
      "/siret/12345678901234",
    );

    expect(response.status).toBe(404);
  });

  it("GET /siret/:siret retourne 200 avec un établissement valide", async () => {
    axiosGetMock
      .mockResolvedValueOnce({
        data: {
          etablissement: {
            adresseEtablissement: {
              codePostalEtablissement: "75001",
              coordonneeLambertAbscisseEtablissement: "[ND]",
            },
            etablissementSiege: true,
            nic: "00012",
            uniteLegale: {
              categorieJuridiqueUniteLegale: "5499",
              denominationUniteLegale: "Association test",
            },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          etablissements: [],
          header: { total: 0 },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            mandataires_sociaux: [],
            nom_commercial: "Nom commercial test",
          },
        },
      });

    const response = await request(getFoAppHelper()).get(
      "/siret/12345678901234",
    );

    expect(response.status).toBe(200);
    expect(response.body.uniteLegale).toBeDefined();
  });

  it("GET /siret/check-api-insee existe", async () => {
    const response = await request(getFoAppHelper()).get(
      "/siret/check-api-insee",
    );

    expect(response.status).toBe(503);
  });

  it("GET /siret/check-api-entreprise existe", async () => {
    const response = await request(getFoAppHelper()).get(
      "/siret/check-api-entreprise",
    );

    expect(response.status).toBe(503);
  });

  describe("GET /siret/get-lien-succession/:siret", () => {
    it("retourne 200 avec le successeur", async () => {
      axiosGetMock.mockResolvedValueOnce({
        data: {
          liensSuccession: [
            {
              siretEtablissementSuccesseur: { siret: "99999999999999" },
            },
          ],
        },
      });

      const response = await request(getFoAppHelper()).get(
        "/siret/get-lien-succession/12345678901234",
      );

      expect(response.status).toBe(200);
      expect(response.body.siretEtablissementSuccesseur.siret).toBe(
        "99999999999999",
      );
    });

    it("retourne 404 EtablissementNoSuccesseur si l'API renvoie 404", async () => {
      axiosGetMock.mockRejectedValueOnce({
        response: { status: 404 },
      });

      const response = await request(getFoAppHelper()).get(
        "/siret/get-lien-succession/12345678901234",
      );

      expect(response.status).toBe(404);
      expect(response.body.name).toBe(ERRORS_SIRET.EtablissementNoSuccesseur);
    });

    it("retourne 404 SiretError si l'API renvoie une autre erreur", async () => {
      axiosGetMock.mockRejectedValueOnce({
        response: { status: 500 },
      });

      const response = await request(getFoAppHelper()).get(
        "/siret/get-lien-succession/12345678901234",
      );

      expect(response.status).toBe(404);
      expect(response.body.name).toBe(ERRORS_SIRET.SiretError);
    });
  });
});
