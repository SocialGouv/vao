import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";

import axios from "axios";
import { NextFunction, Request, Response } from "express";

import AppError from "../utils/error";
import scanFile from "./scan-file";

jest.mock("../config", () => ({
  config: {
    antivirusUrl: "https://antivirus.test/scan",
  },
}));

const axiosPostMock = axios.post as jest.Mock;

type UploadedFile = {
  destination: string;
  encoding: string;
  fieldname: string;
  filename: string;
  mimetype: string;
  originalname: string;
  path: string;
  size: number;
  stream: Readable;
};

function getNextAppError(next: jest.MockedFunction<NextFunction>): AppError {
  const error: unknown = next.mock.calls[0]?.[0];
  if (!(error instanceof AppError)) {
    throw new Error("Expected AppError");
  }
  return error;
}

function createRequest(file?: UploadedFile): Request {
  return { file } as Request;
}

async function runScanFile(file?: UploadedFile) {
  const req = createRequest(file);
  const res = {} as Response;
  const next = jest.fn() as jest.MockedFunction<NextFunction>;

  await scanFile(req, res, next);

  return next;
}

describe("middlewares/scan-file", () => {
  let filePath: string;
  let file: UploadedFile;

  beforeEach(() => {
    jest.clearAllMocks();

    const directory = mkdtempSync(join(tmpdir(), "scan-file-"));
    filePath = join(directory, "document.pdf");
    writeFileSync(filePath, "contenu test");

    file = {
      destination: directory,
      encoding: "7bit",
      fieldname: "file",
      filename: "document.pdf",
      mimetype: "application/pdf",
      originalname: "document.pdf",
      path: filePath,
      size: 13,
      stream: new Readable({ read() {} }),
    };
  });

  it("appelle next avec une erreur 400 si aucun fichier n'est présent", async () => {
    const next = await runScanFile();

    expect(next).toHaveBeenCalledTimes(1);
    const error = getNextAppError(next);
    expect(error.message).toBe("Fichier manquant");
    expect(error.statusCode).toBe(400);
    expect(axiosPostMock).not.toHaveBeenCalled();
  });

  it("appelle next sans erreur lorsque le scan est propre", async () => {
    axiosPostMock.mockResolvedValueOnce({
      data: {
        data: {
          result: [{ viruses: [] }],
        },
        success: true,
      },
    });

    const next = await runScanFile(file);

    expect(axiosPostMock).toHaveBeenCalledWith(
      "https://antivirus.test/scan",
      expect.any(Object),
      expect.objectContaining({
        headers: expect.any(Object),
      }),
    );
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it("appelle next avec une erreur 503 si le service antivirus répond en échec", async () => {
    axiosPostMock.mockResolvedValueOnce({
      data: {
        success: false,
      },
    });

    const next = await runScanFile(file);

    const error = getNextAppError(next);
    expect(error.message).toBe("Le service antivirus n'est pas disponible");
    expect(error.name).toBe("file.scan-antivirus-unavailable");
    expect(error.statusCode).toBe(503);
  });

  it("appelle next avec une erreur lorsqu'une menace est détectée", async () => {
    axiosPostMock.mockResolvedValueOnce({
      data: {
        data: {
          result: [{ viruses: ["EICAR-Test-File"] }],
        },
        success: true,
      },
    });

    const next = await runScanFile(file);

    const error = getNextAppError(next);
    expect(error.message).toBe("Scan returns threat on file document.pdf");
    expect(error.name).toBe("file.scan-antivirus");
    expect(error.statusCode).toBe(400);
  });

  it("appelle next avec une erreur 503 si l'appel axios échoue", async () => {
    const networkError = new Error("network error");
    axiosPostMock.mockRejectedValueOnce(networkError);

    const next = await runScanFile(file);

    const error = getNextAppError(next);
    expect(error.message).toBe("Le service antivirus n'est pas disponible");
    expect(error.name).toBe("file.scan-antivirus-unavailable");
    expect(error.statusCode).toBe(503);
    expect(error.cause).toBe(networkError);
  });

  it("appelle next sans erreur si la réponse est incomplète malgré success à true", async () => {
    axiosPostMock.mockResolvedValueOnce({
      data: {
        success: true,
      },
    });

    const next = await runScanFile(file);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });
});
