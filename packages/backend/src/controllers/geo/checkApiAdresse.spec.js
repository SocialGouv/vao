const checkApiAdresse = require("./checkApiAdresse");
const { checkApiSearchAdresse } = require("../../services/AdresseApi");

jest.mock("../../services/AdresseApi", () => ({
  checkApiSearchAdresse: jest.fn(),
}));

describe("controllers/geo/checkApiAdresse", () => {
  it("appelle next avec AppError quand le service échoue", async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    const error = new Error("boom");

    checkApiSearchAdresse.mockRejectedValueOnce(error);

    await checkApiAdresse(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const nextError = next.mock.calls[0][0];
    expect(nextError.name).toBe("ADRESSE_UNAVAILABLE");
    expect(nextError.statusCode).toBe(503);
    expect(nextError.message).toBe("L'API ne semble pas répondre");
  });
});
