const Commune = require("../../services/geo/Commune");
const controller = require("./commune");

jest.mock("../../services/geo/Commune", () => ({
  fetch: jest.fn(),
  get: jest.fn(),
}));

describe("controllers/geo/commune", () => {
  it("fetch appelle next(error) quand le service échoue", async () => {
    const error = new Error("boom");
    const req = {
      query: {
        departement: "75",
      },
    };
    const res = {
      json: jest.fn(),
    };
    const next = jest.fn();

    Commune.fetch.mockRejectedValueOnce(error);

    await controller.fetch(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("get appelle next(error) quand le service échoue", async () => {
    const error = new Error("boom");
    const req = {
      params: {
        communeCode: "75056",
      },
      query: {},
    };
    const res = {
      json: jest.fn(),
    };
    const next = jest.fn();

    Commune.get.mockRejectedValueOnce(error);

    await controller.get(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
