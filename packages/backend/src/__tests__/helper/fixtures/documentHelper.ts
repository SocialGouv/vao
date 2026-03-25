//import * as DocumentService from "../../../services/Document";
import { getPool as getPoolDoc } from "../../../utils/pgpoolDoc";
import { createMinimalPdf } from "../fileHelper";

export const createDocument = async ({
  userId,
}: {
  userId: string | number | null;
}): Promise<string> => {
  const fileContent = await createMinimalPdf();
  // Nécessite un conteneur S3 pour pouvoir être utilisé
  /*
  const uuid = DocumentService.createFile(
    "document.pdf",
    "declaration",
    "application/pdf",
    fileContent,
    userId,
  );
  */
  const rows = await getPoolDoc().query(
    `INSERT INTO doc.documents
        (category, filename, mime_type, user_id, file)
      VALUES ($1, $2, $3, $4, $5) RETURNING uuid`,
    ["declaration", "document.pdf", "application/pdf", userId, fileContent],
  );

  const uuid = rows.rows[0].uuid;
  return uuid;
};
