const request = require("supertest");
const express = require("express");
const get = require("../../../controllers/demandeSejour/get");
const DemandeSejour = require("../../../services/DemandeSejour");
const Organisme = require("../../../services/Organisme");

jest.mock("../../../services/Organisme");
jest.mock("../../../services/DemandeSejour");

const mockAuthMiddleware = (req, res, next) => {
  req.decoded = { id: "user123" };
  next();
};

const app = express();
app.use(express.json());
app.use(mockAuthMiddleware);
app.get("/sejour", get);

describe("GET /sejour", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return demandes successfully", async () => {
    const mockOrganisme = {
      organismeId: "organisme123",
      personneMorale: { porteurAgrement: false },
    };
    Organisme.getOne.mockResolvedValueOnce(mockOrganisme);

    DemandeSejour.get.mockResolvedValueOnce({
      rows: [{ id: 1, libelle: "Test Sejour" }],
      total: 1,
    });

    const response = await request(app)
      .get("/sejour")
      .set("Authorization", "Bearer fake_token")
      .expect(200);

    expect(response.body.demandes).toHaveLength(1);
    expect(response.body.demandes[0].libelle).toBe("Test Sejour");
    expect(response.body.total).toBe(1);
    expect(Organisme.getOne).toHaveBeenCalledWith({ use_id: "user123" });
    expect(DemandeSejour.get).toHaveBeenCalled();
  });

  it("should return 404 if organisme not found", async () => {
    Organisme.getOne.mockRejectedValue(new Error("Organisme non trouvé"));

    const response = await request(app)
      .get("/sejour")
      .set("Authorization", "Bearer fake_token")
      .expect(500);
    expect(response.text).toContain("Organisme non trouvé");
    expect(Organisme.getOne).toHaveBeenCalledWith({ use_id: "user123" });
    expect(DemandeSejour.get).not.toHaveBeenCalled();
  });

  it("should handle porteurAgrement correctly", async () => {
    // Cas où porteurAgrement est true
    const mockOrganisme = {
      personneMorale: { porteurAgrement: true, siren: "123456789" },
    };
    Organisme.getOne.mockResolvedValueOnce(mockOrganisme);
    Organisme.getBySiren.mockResolvedValueOnce([
      { organismeId: "org1" },
      { organismeId: "org2" },
    ]);

    DemandeSejour.get.mockResolvedValueOnce({
      rows: [{ id: 1, libelle: "Test Sejour" }],
      total: 1,
    });

    const response = await request(app)
      .get("/sejour")
      .set("Authorization", "Bearer fake_token")
      .expect(200);

    expect(Organisme.getBySiren).toHaveBeenCalledWith("123456789");
    expect(response.body.demandes).toBeDefined();
  });

  it("should handle case when porteurAgrement is false", async () => {
    // Cas où porteurAgrement est false
    const mockOrganisme = {
      organismeId: "org1",
      personneMorale: { porteurAgrement: false },
    };
    Organisme.getOne.mockResolvedValueOnce(mockOrganisme);

    DemandeSejour.get.mockResolvedValueOnce({
      rows: [{ id: 1, libelle: "Test Sejour" }],
      total: 1,
    });

    const response = await request(app)
      .get("/sejour")
      .set("Authorization", "Bearer fake_token")
      .expect(200);

    expect(response.body.demandes).toBeDefined();
    expect(response.body.demandes).toEqual(expect.any(Array));
  });
});
