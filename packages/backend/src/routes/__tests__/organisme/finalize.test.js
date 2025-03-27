const checkJWT = require("../../../middlewares/checkJWT");
const checkPermissionOrganisme = require("../../../middlewares/checkPermissionOrganisme");
const request = require("supertest");
const app = require("../../../app");
const Organisme = require("../../../services/Organisme");

jest.mock("../../../middlewares/checkJWT");
jest.mock("../../../middlewares/checkPermissionOrganisme");
jest.mock("../../../services/Organisme");

describe("POST /organisme/:id/finalize", () => {
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

  it("should return a 200", async () => {
    const response = await request(app).post("/organisme/1/finalize");
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("message", "sauvegarde organisme OK");
    expect(Organisme.finalize).toHaveBeenCalled();
  });
});
