const Departement = require("../../services/geo/Departement");
const controller = require("./departement");

jest.mock("../../services/geo/Departement", () => ({
  fetch: jest.fn(),
}));

describe("controllers/geo/departement", () => {
  it("fetch appelle next(error) quand le service échoue", async () => {
    const error = new Error("boom");
    const req = {};
    const res = {
      json: jest.fn(),
    };
    const next = jest.fn();

    Departement.fetch.mockRejectedValueOnce(error);

    await controller.fetch(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
