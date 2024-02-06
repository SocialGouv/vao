const fs = require("fs");
const logger = require("../utils/logger");
const poolDoc = require("../pgpoolDoc").getPool();
const AppError = require("../utils/error");

const log = logger(module.filename);

const query = {
  create: `
    INSERT INTO doc.agrements 
      (filename, mime_type, file) 
    VALUES 
      ( $1, $2, $3) 
    RETURNING uuid`,

  getFiles: () => [
    `
    SELECT  doc_gui_uuid AS uuid,
            doc_gui_filename AS fileName, 
            doc_gui_mime_type AS mimeType, 
            doc_gui_file AS file, 
            doc_gui_options AS options 
      FROM doc.guide`,
  ],
  getByUuid: `SELECT  doc_gui_uuid AS uuid,
                      doc_gui_filename as filename,
                      doc_gui_mime_type as mimeType,
                      doc_gui_file as file,
                      doc_gui_options as options
    FROM doc.guide 
    WHERE doc_gui_uuid =$1;`,
  deleteByUuid: `DELETE FROM doc.guide 
    WHERE doc_gui_uuid = $1;`,
};

module.exports.deleteFile = (path) => {
  fs.unlink(path, (err) => {
    if (err) {
      throw err;
    }

    log.i("Delete file successfully.");
  });
};

module.exports.uploadFile = async (file) => {
  log.i("uploadFile - In");
  try {
    const { path } = file;
    return new Promise((resolve, reject) => {
      fs.readFile(path, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    }).then(async (data) => {
      log.d("uploadFile", [file.originalname, file.mimetype, data]);
      const response = await poolDoc.query(query.create, [
        file.originalname,
        file.mimetype,
        data,
      ]);
      log.d("uploadFile - Done");
      return response.rows[0].uuid;
    });
  } catch (err) {
    log.w(err);
    throw new AppError("uploadFile failed", { cause: err });
  }
};

// module.exports.getFiles = async () => {
//   log.i("getFiles - In");
//   try {
//     const response = await poolDoc.query(...query.getFiles());
//     log.i("getFiles - Done");
//     return response.rows;
//   } catch (err) {
//     log.w(err);
//     throw new AppError("getFiles failed", { cause: err });
//   }
// };

// module.exports.getByUuid = async (uuid) => {
//   log.i("In");
//   try {
//     const response = await poolDoc.query(query.getByUuid, [uuid]);
//     if (response.rows.length > 0) {
//       log.i("Done", response.rows[0]);
//       return response.rows[0];
//     }
//     log.i("Done");
//     return null;
//   } catch (err) {
//     log.w(err);
//     throw new Error("query.getByUuid failed", { cause: err });
//   }
// };

// module.exports.deleteByUuid = async (uuid) => {
//   log.i("In");
//   try {
//     const response = await poolDoc.query(query.deleteByUuid, [uuid]);
//     if (!response) {
//       log.w("erreur lors de la suppression");
//       return null;
//     }
//     log.i("Done");
//     return "ficher supprimé";
//   } catch (err) {
//     log.w(err);
//     throw new Error("query.getByUuid failed", { cause: err });
//   }
// };
