import request from "supertest";

import * as DocumentService from "../../services/Document";
import { getPoolDoc } from "../../utils/pgpoolDoc";
import { getBoAppHelper } from "../helpers/appHelper";
import { createMinimalPdf } from "../helpers/fileHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import { createUsagersUser } from "../helpers/userHelper";

// Contrôle de droits couvert par checkPermissionBoToDownload.test.ts.
jest.mock(
  "../../middlewares/checkPermissionBoToDownload",
  () =>
    (
      _req: import("express").Request,
      _res: import("express").Response,
      next: import("express").NextFunction,
    ) =>
      next(),
);

jest.setTimeout(30000);

beforeAll(async () => {
  await createTestContainer({ pg: true, s3: true });
});

afterAll(async () => {
  await removeTestContainer();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /documents/admin/:uuid", () => {
  it("devrait retourner 404 si les métadonnées du fichier sont introuvables", async () => {
    const response = await request(getBoAppHelper({ id: 1 })).get(
      "/documents/admin/550e8400-e29b-41d4-a716-446655440000",
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
    const response = await request(getBoAppHelper()).get(
      `/documents/admin/${uuid}`,
    );

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
    const response = await request(getBoAppHelper()).get(
      `/documents/admin/${uuid}`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual(fileContent);
  });

  it("devrait retourner le fichier avec les bons headers", async () => {
    const user = await createUsagersUser();
    const fileContent = await createMinimalPdf();
    const uuid = await DocumentService.createFile(
      "document-admin.pdf",
      "declaration",
      "application/pdf",
      fileContent,
      user.id,
    );
    const response = await request(getBoAppHelper()).get(
      `/documents/admin/${uuid}`,
    );

    expect(response.status).toBe(200);
    expect(response.headers["content-disposition"]).toBe(
      "attachment; filename=document-admin.pdf",
    );
    expect(response.headers["content-type"]).toContain("application/pdf");
    expect(response.body).toStrictEqual(fileContent);
  });
});
