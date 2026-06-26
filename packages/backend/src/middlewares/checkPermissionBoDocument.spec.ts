import { FILE_CATEGORY } from "@vao/shared-bridge";
import type { NextFunction, Response } from "express";

import { getCategoryDef } from "../helpers/documents";
import * as DocumentService from "../services/Document";
import type { UserRequest } from "../types/request";
import { isUserAllowedForDroit } from "../utils/droits";
import checkPermissionBoDocument from "./checkPermissionBoDocument";

jest.mock("../services/Document");
jest.mock("../helpers/documents");
jest.mock("../utils/droits");

const mockedGetFileMetaData =
  DocumentService.getFileMetaData as jest.MockedFunction<
    typeof DocumentService.getFileMetaData
  >;
const mockedGetCategoryDef = getCategoryDef as jest.MockedFunction<
  typeof getCategoryDef
>;
const mockedIsUserAllowed = isUserAllowedForDroit as jest.MockedFunction<
  typeof isUserAllowedForDroit
>;

const buildReq = (overrides: Partial<UserRequest> = {}): UserRequest =>
  ({
    decoded: { id: "7", territoireCode: "75" },
    params: { uuid: "uuid-1" },
    ...overrides,
  }) as unknown as UserRequest;

const run = async (req: UserRequest) => {
  const next = jest.fn() as unknown as NextFunction;
  await checkPermissionBoDocument(req, {} as Response, next);
  return next as unknown as jest.Mock;
};

const fileMetaData = {
  category: FILE_CATEGORY.ARRETE_AGREMENT,
  createdAt: new Date(),
  name: "doc.pdf",
  userId: "1",
  uuid: "uuid-1",
} as Awaited<ReturnType<typeof DocumentService.getFileMetaData>>;

describe("checkPermissionBoDocument", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renvoie 400 si l'uuid ou l'utilisateur manque", async () => {
    let next = await run(buildReq({ params: {} as never }));
    expect(next.mock.calls[0][0].statusCode).toBe(400);

    next = await run(buildReq({ decoded: undefined }));
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it("renvoie 404 si le fichier est introuvable", async () => {
    mockedGetFileMetaData.mockResolvedValue(null);
    const next = await run(buildReq());
    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });

  it("refuse (403) une catégorie non gérée par le registre", async () => {
    mockedGetFileMetaData.mockResolvedValue(fileMetaData);
    mockedGetCategoryDef.mockReturnValue(null);
    const next = await run(buildReq());
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });

  it("refuse (403) si la ressource protégée est introuvable", async () => {
    mockedGetFileMetaData.mockResolvedValue(fileMetaData);
    mockedGetCategoryDef.mockReturnValue({
      droit: "agrement",
      resolveResourceId: jest.fn().mockResolvedValue(null),
    });
    const next = await run(buildReq());
    expect(next.mock.calls[0][0].statusCode).toBe(403);
    expect(mockedIsUserAllowed).not.toHaveBeenCalled();
  });

  it("refuse (403) si l'utilisateur n'a pas le droit", async () => {
    mockedGetFileMetaData.mockResolvedValue(fileMetaData);
    mockedGetCategoryDef.mockReturnValue({
      droit: "agrement",
      resolveResourceId: jest.fn().mockResolvedValue(123),
    });
    mockedIsUserAllowed.mockResolvedValue(false);
    const next = await run(buildReq());
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });

  it("laisse passer (next sans erreur) si l'utilisateur est autorisé", async () => {
    mockedGetFileMetaData.mockResolvedValue(fileMetaData);
    mockedGetCategoryDef.mockReturnValue({
      droit: "agrement",
      resolveResourceId: jest.fn().mockResolvedValue(123),
    });
    mockedIsUserAllowed.mockResolvedValue(true);
    const next = await run(buildReq());
    expect(next).toHaveBeenCalledWith();
    expect(mockedIsUserAllowed).toHaveBeenCalledWith("agrement", 123, "7");
  });

  it("propage une erreur si la résolution de la ressource échoue", async () => {
    mockedGetFileMetaData.mockResolvedValue(fileMetaData);
    mockedGetCategoryDef.mockReturnValue({
      droit: "agrement",
      resolveResourceId: jest.fn().mockRejectedValue(new Error("boom")),
    });
    const next = await run(buildReq());
    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(mockedIsUserAllowed).not.toHaveBeenCalled();
  });
});
