const Region = require("../../services/geo/Region");
const controller = require("./region");

jest.mock("../../services/geo/Region", () => ({
  fetch: jest.fn(),
}));

describe("controllers/geo/region", () => {
  it("fetch appelle next(error) quand le service échoue", async () => {
    const error = new Error("boom");
    const req = {};
    const res = {
      json: jest.fn(),
    };
    const next = jest.fn();

    Region.fetch.mockRejectedValueOnce(error);

    await controller.fetch(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
