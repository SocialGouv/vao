const checkJWT = require("../../../middlewares/checkJWT");
const checkPermissionOrganisme = require("../../../middlewares/checkPermissionOrganisme");
const request = require("supertest");
const app = require("../../../app");
const Organisme = require("../../../services/Organisme");

jest.mock("../../../middlewares/checkJWT");
jest.mock("../../../middlewares/checkPermissionOrganisme");
jest.mock("../../../services/Organisme");

describe("POST /organisme/:id", () => {
  const user = {
    id: 1,
  };
  beforeEach(() => {
    jest.clearAllMocks();
    checkJWT.mockImplementation((req, res, next) => {
      req.decoded = { ...user };
      next();
    });
    checkPermissionOrganisme.mockImplementation((req, res, next) => {
      next();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return an error 200 if organism complet and try to change siret", async () => {
    Organisme.getIsComplet.mockResolvedValue(true);
    Organisme.getBySiret.mockResolvedValue({
      organismeId: 1,
    });
    Organisme.getSiret.mockResolvedValue("38456094200045");

    const response = await request(app)
      .post("/organisme/1")
      .send({
        parametre: { siret: "38456094200044" },
        type: "personne_morale",
      });
    expect(response.statusCode).toBe(200);
  });

  it("should work if the organism is complet and the siret is not changed", async () => {
    Organisme.getIsComplet.mockResolvedValue(true);
    Organisme.getBySiret.mockResolvedValue({
      organismeId: 1,
    });
    Organisme.getSiret.mockResolvedValue("38456094200045");

    const response = await request(app)
      .post("/organisme/1")
      .send({
        parametre: { siret: "38456094200045" },
        type: "personne_morale",
      });
    expect(response.statusCode).toBe(200);
    expect(Organisme.update).toHaveBeenCalled();
  });

  it("should return an error 403 if organism not complete and another organism with the same siret exists", async () => {
    Organisme.getIsComplet.mockResolvedValue(false);
    Organisme.getBySiret.mockResolvedValue({
      organismeId: 2,
    });
    Organisme.getSiret.mockResolvedValue("38456094200045");

    const response = await request(app)
      .post("/organisme/1")
      .send({
        parametre: { siret: "38456094200044" },
        type: "personne_morale",
      });
    expect(response.statusCode).toBe(403);
    expect(response.body).toHaveProperty(
      "name",
      "Forbidden - siret update - organisme incomplete",
    );
  });

  it("should work if the organism is not complete and the siret is new", async () => {
    Organisme.getIsComplet.mockResolvedValue(false);
    Organisme.getBySiret.mockResolvedValue(null);
    Organisme.getSiret.mockResolvedValue("38456094200044");

    const response = await request(app)
      .post("/organisme/1")
      .send({
        parametre: { siret: "38456094200045" },
        type: "personne_morale",
      });
    expect(response.statusCode).toBe(200);
    expect(Organisme.update).toHaveBeenCalled();
  });

  it("should work if the organism is not complete and the siret is the current siret", async () => {
    Organisme.getIsComplet.mockResolvedValue(false);
    Organisme.getBySiret.mockResolvedValue({
      organismeId: 1,
    });
    Organisme.getSiret.mockResolvedValue("38456094200044");

    const response = await request(app)
      .post("/organisme/1")
      .send({
        parametre: { siret: "38456094200044" },
        type: "personne_morale",
      });
    expect(response.statusCode).toBe(200);
    expect(Organisme.update).toHaveBeenCalled();
  });
});
