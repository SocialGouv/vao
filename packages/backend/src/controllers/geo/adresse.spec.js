const axios = require("axios");
const controller = require("./adresse");

jest.mock("axios");

describe("controllers/geo/adresse", () => {
  it("retourne 400 quand l'appel axios échoue", async () => {
    const req = {
      body: {
        queryString: "paris",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    axios.get.mockRejectedValueOnce(new Error("boom"));

    await controller.fetch(req, res);
    await new Promise(process.nextTick);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "erreur lors de l'appel à l'API adresse",
    });
  });
});
