const checkJWT = require("../../../middlewares/checkJWT");
const request = require("supertest");
const app = require("../../../app");
const eigService = require("../../../services/eig");

jest.mock("../../../middlewares/checkJWT");
jest.mock("../../../services/eig");

describe("GET /eig/me", () => {
  const user = {
    id: 1,
  };
  beforeEach(() => {
    jest.resetAllMocks();
    checkJWT.mockImplementation((req, res, next) => {
      req.decoded = { ...user };
      next();
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should send a 400 if query params are not ok", async () => {
    const response = await request(app).get("/eig/me?sortBy=badSort");
    expect(response.statusCode).toBe(400);
    expect(eigService.getByUserId).not.toHaveBeenCalled();
  });

  it("should call getByDsId if everything is ok", async () => {
    const response = await request(app).get("/eig/me");
    expect(response.statusCode).toBe(200);
    expect(eigService.getByUserId).toHaveBeenCalled();
  });
});
