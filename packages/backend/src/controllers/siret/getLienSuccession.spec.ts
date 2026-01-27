import type { SiretRoutes } from "@vao/shared-bridge";
import { ERRORS_SIRET } from "@vao/shared-bridge";
import type { NextFunction } from "express";

import { getEtablissementSuccesseur } from "../../services/Insee";
import type { RouteRequest, RouteResponse } from "../../types/request";
import AppError from "../../utils/error";
import get from "./getLienSuccession";

jest.mock("../../services/Insee");

describe("Route getLienSuccession", () => {
  const mockedGetEtablissementSuccesseur =
    getEtablissementSuccesseur as jest.Mock;

  let req: RouteRequest<SiretRoutes["GetSuccesseur"]>;
  let res: RouteResponse<SiretRoutes["GetSuccesseur"]>;
  let next: NextFunction & jest.Mock;

  beforeEach(() => {
    req = {
      body: undefined,
      params: { siret: "12345678901234" },
      query: undefined,
    } as unknown as RouteRequest<SiretRoutes["GetSuccesseur"]>;

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as RouteResponse<SiretRoutes["GetSuccesseur"]>;

    next = jest.fn() as unknown as NextFunction & jest.Mock;

    jest.clearAllMocks();
  });

  // --- SUCCESS ---
  it("should return 200 with siretEtablissementSuccesseur", async () => {
    const mockReturn = {
      siretEtablissementSuccesseur: { siret: "99999999999999" },
    };

    mockedGetEtablissementSuccesseur.mockResolvedValue(mockReturn);

    await get(req, res, next);

    expect(mockedGetEtablissementSuccesseur).toHaveBeenCalledWith({
      siret: "12345678901234",
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockReturn);
    expect(next).not.toHaveBeenCalled();
  });

  // --- 404 ERROR FROM API ---
  it("should call next with EtablissementNoSuccesseur error when service returns 404", async () => {
    const error = { response: { status: 404 } };
    mockedGetEtablissementSuccesseur.mockRejectedValue(error);

    await get(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const errPassed = next.mock.calls[0][0] as AppError;

    expect(errPassed).toBeInstanceOf(AppError);
    expect(errPassed.statusCode).toBe(404);
    expect(errPassed.name).toBe(ERRORS_SIRET.EtablissementNoSuccesseur);
  });

  // --- OTHER ERROR ---
  it("should call next with SiretError when service returns other error", async () => {
    const error = { response: { status: 500 } };
    mockedGetEtablissementSuccesseur.mockRejectedValue(error);

    await get(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const errPassed = next.mock.calls[0][0] as AppError;

    expect(errPassed).toBeInstanceOf(AppError);
    expect(errPassed.statusCode).toBe(404);
    expect(errPassed.name).toBe(ERRORS_SIRET.SiretError);
  });
});
