import type { Request, Response } from "express";

import getByOrganismeIdController from "../../controllers/agrement"; // ton contrôleur
import getByOrganismeIdService from "../../services/agrements/Agrements";
import AppError from "../../utils/error";

// On mocke les dépendances
jest.mock("../../services/agrements/Agrements");
jest.mock("../../utils/logger", () => () => ({
  d: jest.fn(),
  i: jest.fn(),
  w: jest.fn(),
}));

describe("🧪 Controller: agrement.getByOrganismeId", () => {
  const mockReq = {} as Request;
  const mockRes = {} as Response;
  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockRes.json = jest.fn().mockReturnValue(mockRes);
  });

  it("Renvoie le résultat du service avec un ID valide", async () => {
    (getByOrganismeIdService as jest.Mock).mockResolvedValue({
      agrement: { id: 1, organismeId: 42 },
    });

    mockReq.params = { id: "42" };

    await getByOrganismeIdController.getByOrganismeId(
      mockReq as any,
      mockRes,
      mockNext,
    );

    expect(getByOrganismeIdService).toHaveBeenCalledWith({ organismeId: 42 });
    expect(mockRes.json).toHaveBeenCalledWith({
      agrement: { id: 1, organismeId: 42 },
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("Appelle next avec une AppError si l'id est invalide", async () => {
    mockReq.params = { id: "abc" };

    await getByOrganismeIdController.getByOrganismeId(
      mockReq as any,
      mockRes,
      mockNext,
    );

    expect(getByOrganismeIdService).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledTimes(1);

    const error = mockNext.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe("Paramètre incorrect");
    expect(error.statusCode).toBe(400);
  });

  it("Appelle next si le service lève une erreur", async () => {
    (getByOrganismeIdService as jest.Mock).mockRejectedValue(
      new Error("DB fail"),
    );
    mockReq.params = { id: "10" };

    await getByOrganismeIdController.getByOrganismeId(
      mockReq as any,
      mockRes,
      mockNext,
    );

    expect(getByOrganismeIdService).toHaveBeenCalledWith({ organismeId: 10 });
    expect(mockNext).toHaveBeenCalledTimes(1);

    const error = mockNext.mock.calls[0][0];
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("DB fail");
  });
});
