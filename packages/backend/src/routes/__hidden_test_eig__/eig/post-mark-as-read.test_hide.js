const boCheckJWT = require("../../../middlewares/bo-check-JWT");

const request = require("supertest");
const app = require("../../../app");
const eigService = require("../../../services/eig");
const { statuts } = require("../../../helpers/eig");

jest.mock("../../../middlewares/bo-check-JWT");
jest.mock("../../../services/eig");
jest.mock("../../../services/DemandeSejour");
jest.mock("../../../utils/mail");
jest.mock("../../../services/mail");
jest.mock("../../../services/geo/Region");
jest.mock("../../../services/geo/Departement");

describe("GET /eig/admin/:id/mark-as-read", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  const user = {
    id: 1,
  };
  beforeEach(() => {
    jest.resetAllMocks();
    boCheckJWT.mockImplementation((req, res, next) => {
      req.decoded = {
        ...user,
        roles: ["eig", "DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
      };
      next();
    });
    eigService.getById.mockReturnValue({
      agrementRegionObtention: "BRE",
      statut: statuts.ENVOYE,
      territoireCode: 92,
    });
  });

  it("shoud return a 403 if the admin don't have role eig", async () => {
    boCheckJWT.mockImplementation((req, res, next) => {
      req.decoded = {
        ...user,
        roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
      };
      next();
    });
    const response = await request(app)
      .post("/eig/admin/1/mark-as-read")
      .send({});
    expect(response.statusCode).toBe(403);
    expect(eigService.markAsRead).not.toHaveBeenCalled();
  });

  it("should return a 400 if eig don't have the good statut", async () => {
    eigService.getById.mockReturnValue({ statut: statuts.LU });
    const response = await request(app)
      .post("/eig/admin/1/mark-as-read")
      .send({});

    expect(response.statusCode).toBe(400);
    expect(eigService.markAsRead).not.toHaveBeenCalled();
  });

  it("should return a 400 The user don't have any action to do", async () => {
    boCheckJWT.mockImplementation((req, res, next) => {
      req.decoded = {
        ...user,
        roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture", "eig"],
        territoireCode: 93,
      };
      next();
    });
    const responseDep = await request(app)
      .post("/eig/admin/1/mark-as-read")
      .send({});

    expect(responseDep.statusCode).toBe(400);
    expect(eigService.markAsRead).not.toHaveBeenCalled();

    boCheckJWT.mockImplementation((req, res, next) => {
      req.decoded = {
        ...user,
        roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture", "eig"],
        territoireCode: "IDF",
      };
      next();
    });
    const responseREG = await request(app)
      .post("/eig/admin/1/mark-as-read")
      .send({});

    expect(responseREG.statusCode).toBe(400);
    expect(eigService.markAsRead).not.toHaveBeenCalled();
  });

  it("should call markAsRead if everything is of", async () => {
    const response = await request(app)
      .post("/eig/admin/1/mark-as-read")
      .send({});

    expect(response.statusCode).toBe(200);
    expect(eigService.markAsRead).toHaveBeenCalledWith("1", "DDETS");
  });
});
