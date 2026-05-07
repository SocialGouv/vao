import axios from "axios";
import request from "supertest";

import app from "../../app";
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

describe("Domaine /geo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /geo/check-api-adresse", () => {
    it("répond 200 lorsque l'API adresse est joignable", async () => {
      axiosGetMock.mockResolvedValueOnce({
        data: { features: [{ properties: { label: "Paris" } }] },
      });

      const response = await request(app).get("/geo/check-api-adresse");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("répond 503 lorsque l'API adresse ne répond pas", async () => {
      axiosGetMock.mockRejectedValueOnce(new Error("network error"));

      const response = await request(app).get("/geo/check-api-adresse");

      expect(response.status).toBe(503);
    });
  });

  describe("POST /geo/adresse", () => {
    it("répond 200 avec une liste d'adresses", async () => {
      axiosGetMock.mockResolvedValueOnce({
        data: {
          features: [{ properties: { label: "Paris", score: 0.9 } }],
        },
      });

      const response = await request(app)
        .post("/geo/adresse")
        .send({ queryString: "Paris" });

      expect(response.status).toBe(200);
      expect(response.body.adresses).toHaveLength(1);
      expect(response.body.adresses[0].properties.label).toBe("Paris");
    });

    it("répond 400 en cas d'erreur HTTP API adresse", async () => {
      axiosGetMock.mockRejectedValueOnce(new Error("API indisponible"));

      const response = await request(app)
        .post("/geo/adresse")
        .send({ queryString: "Lyon" });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /geo/departements", () => {
    it("retourne la liste des départements", async () => {
      const response = await request(app).get("/geo/departements");

      expect(response.status).toBe(200);
      expect(response.body.departements).toBeInstanceOf(Array);
      expect(response.body.departements.length).toBeGreaterThan(0);
      const first = response.body.departements[0] as {
        value: string;
        text: string;
        region: string;
      };
      expect(first).toHaveProperty("value");
      expect(first).toHaveProperty("text");
      expect(first).toHaveProperty("region");
    });
  });

  describe("GET /geo/regions", () => {
    it("retourne la liste des régions", async () => {
      const response = await request(app).get("/geo/regions");

      expect(response.status).toBe(200);
      expect(response.body.regions).toBeInstanceOf(Array);
      expect(response.body.regions.length).toBeGreaterThan(0);
      const idf = response.body.regions.find(
        (r: { value: string }) => r.value === "IDF",
      );
      expect(idf?.text).toContain("Île-de-France");
    });
  });

  describe("GET /geo/communes", () => {
    it("retourne les communes filtrées par département", async () => {
      const response = await request(app).get("/geo/communes").query({
        departement: "75",
      });

      expect(response.status).toBe(200);
      expect(response.body.communes).toBeInstanceOf(Array);
      expect(response.body.communes.length).toBeGreaterThan(0);
      expect(
        response.body.communes.every(
          (c: { value: string }) => c.value === "75",
        ),
      ).toBe(true);
      expect(
        response.body.communes.some((c: { text: string }) =>
          c.text.includes("PARIS"),
        ),
      ).toBe(true);
    });
  });

  describe("GET /geo/communes/:communeCode", () => {
    it("répond 200 pour la route détail commune", async () => {
      const response = await request(app).get("/geo/communes/75101");

      expect(response.status).toBe(200);
    });
  });
});
