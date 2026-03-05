import { NextFunction, Response } from "express";
import request from "supertest";

import app from "../../app";
import CheckJWT from "../../middlewares/checkJWT";
import * as DocumentService from "../../services/Document";
import { User, UserRequest } from "../../types/request";
import { getFileTypeFromBuffer } from "../../utils/file";
import { getPool as getPoolDoc } from "../../utils/pgpoolDoc";
import {
  createLargePdf,
  createMinimalGif,
  createMinimalPdf,
  createMinimalPng,
  detectFileType,
} from "../helper/fileHelper";
import { createUsagersUser } from "../helper/fixtures/userHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helper/testContainer";

jest.mock("../../middlewares/checkJWT", () =>
  jest.fn((req: UserRequest, _res: Response, next: NextFunction) => {
    req.decoded = { id: 1, role: "admin" } as unknown as User;
    next();
  }),
);

jest.mock("../../middlewares/scan-file", () => {
  return (_req: UserRequest, _res: Response, next: NextFunction) => next();
});

jest.mock("../../utils/file", () => {
  const actual = jest.requireActual("../../utils/file");
  return {
    ...actual,
    getFileTypeFromBuffer: jest.fn((buf: Buffer) =>
      Promise.resolve(detectFileType(buf)),
    ),
  };
});

beforeAll(async () => {
  await createTestContainer({ pg: true, s3: true });
});

afterAll(async () => {
  await removeTestContainer();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /documents/:uuid", () => {
  it("devrait retourner 404 si le fichier n'est pas trouvé", async () => {
    const response = await request(app).get(
      "/documents/550e8400-e29b-41d4-a716-446655440000",
    );

    expect(response.status).toBe(404);
  });

  it("devrait retourner 404 si le fichier existe en base mais est vide", async () => {
    const user = await createUsagersUser();
    const rows = await getPoolDoc().query(
      `INSERT INTO doc.documents
        (category, filename, mime_type, user_id, file)
      VALUES ($1, $2, $3, $4, $5) RETURNING uuid`,
      [
        "declaration",
        "document.pdf",
        "application/pdf",
        user.id,
        Buffer.from(""),
      ],
    );
    const uuid = rows.rows[0].uuid;
    const response = await request(app).get(`/documents/${uuid}`);

    expect(response.status).toBe(404);
  });

  it("devrait retourner 200 si le fichier existe en base mais pas dans S3", async () => {
    const fileContent = await createMinimalPdf();
    const user = await createUsagersUser();
    const rows = await getPoolDoc().query(
      `INSERT INTO doc.documents
        (category, filename, mime_type, user_id, file)
      VALUES ($1, $2, $3, $4, $5) RETURNING uuid`,
      ["declaration", "document.pdf", "application/pdf", user.id, fileContent],
    );
    const uuid = rows.rows[0].uuid;
    const response = await request(app).get(`/documents/${uuid}`);

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual(fileContent);
  });

  it("devrait retourner le fichier avec les bons headers", async () => {
    const user = await createUsagersUser();
    const pdfBuffer = await createMinimalPdf();
    const uuid = await DocumentService.createFile(
      "document.pdf",
      "declaration",
      "application/pdf",
      pdfBuffer,
      user.id,
    );
    // on s'arrure qu'on récupère bien le fichier depuis s3
    await getPoolDoc().query(
      `UPDATE doc.documents SET file = $1 WHERE uuid = $2`,
      [Buffer.from(""), uuid],
    );

    const response = await request(app).get(`/documents/${uuid}`);

    expect(response.status).toBe(200);
    expect(response.headers["content-disposition"]).toBe(
      "attachment; filename=document.pdf",
    );
    expect(response.headers["content-type"]).toContain("application/pdf");
    expect(response.body).toStrictEqual(pdfBuffer);
  });
});

describe("POST /documents", () => {
  it("devrait accepter un PDF valide et retourner l'uuid", async () => {
    const user = await createUsagersUser();
    (CheckJWT as jest.Mock).mockImplementation(
      (req: UserRequest, _res: Response, next: NextFunction) => {
        req.decoded = user;
        next();
      },
    );
    const pdfBuffer = await createMinimalPdf();

    const response = await request(app)
      .post("/documents")
      .field("category", "declaration")
      .attach("file", pdfBuffer, "document.pdf");

    expect(response.status).toBe(200);
    expect(response.body.uuid).toBeDefined();
  });

  it("devrait accepter un PDF pour la catégorie agrement", async () => {
    const pdfBuffer = await createMinimalPdf();

    const response = await request(app)
      .post("/documents")
      .field("category", "agrement")
      .attach("file", pdfBuffer, "agrement.pdf");

    expect(response.status).toBe(200);
    expect(response.body.uuid).toBeDefined();
  });

  it("devrait retourner 400 si category est manquant", async () => {
    const pdfBuffer = await createMinimalPdf();

    const response = await request(app)
      .post("/documents")
      .attach("file", pdfBuffer, "document.pdf");

    expect(response.status).toBe(400);
    expect(response.body.name).toBe("AppError");
  });

  it("devrait retourner 400 si le fichier est manquant", async () => {
    const response = await request(app)
      .post("/documents")
      .field("category", "declaration");

    expect(response.status).toBe(400);
  });

  it("devrait retourner 415 pour une extension non supportée", async () => {
    const txtBuffer = Buffer.from("contenu texte");

    const response = await request(app)
      .post("/documents")
      .field("category", "declaration")
      .attach("file", txtBuffer, "fichier.txt");

    expect(response.status).toBe(415);
    expect(response.body.name).toBe("FileTypeError");
  });

  it("devrait retourner 415 pour une extension reconnue mais non supportée", async () => {
    const gifBuffer = createMinimalGif();

    const response = await request(app)
      .post("/documents")
      .field("category", "declaration")
      .attach("file", gifBuffer, "image.gif");

    expect(response.status).toBe(415);
    expect(response.body.name).toBe("FileExtensionError");
  });

  it("devrait retourner 415 pour agrement avec un fichier non-PDF (agrement)", async () => {
    const pngBuffer = createMinimalPng();

    const response = await request(app)
      .post("/documents")
      .field("category", "agrement")
      .attach("file", pngBuffer, "image.png");

    expect(response.status).toBe(415);
    expect(response.body.name).toBe("FileTypePdfOnlyError");
  });

  it("devrait retourner 415 pour agrement avec un fichier gif mal nommé)", async () => {
    const gifBuffer = createMinimalGif();

    (getFileTypeFromBuffer as jest.Mock).mockResolvedValue({
      ext: "png",
      mime: "image/gif",
    });

    const response = await request(app)
      .post("/documents")
      .field("category", "declaration")
      .attach("file", gifBuffer, "image.png");

    expect(response.status).toBe(415);
    expect(response.body.name).toBe("FileExtensionError");
  });

  it("devrait retourner 413 si le fichier dépasse 5 Mo", async () => {
    const largeBuffer = await createLargePdf();

    const response = await request(app)
      .post("/documents")
      .field("category", "declaration")
      .attach("file", largeBuffer, "gros-fichier.pdf");

    expect(response.status).toBe(413);
    expect(response.body.name).toBe("FileIsTooLargeError");
  });
});
