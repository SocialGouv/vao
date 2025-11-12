const logger = require("../../utils/logger");
const { getPool } = require("../../utils/pgpool");
const { getFileMetaData } = require("../Document");

const log = logger(module.filename);

const query = {
  associatePTFiles: `
    INSERT INTO front.org_protocole_transport_files (
      protocole_transport_id, 
      files
      )
    VALUES ($1, $2)
  `,
  associatePTM: (nbRows) => `
    INSERT INTO
      front.opt_to_ptm (protocole_transport_id, mode_transport_id)
    VALUES
      ${new Array(nbRows)
        .fill(null)
        .map(
          (_, index) =>
            `($1, (SELECT id FROM front.protocole_transport_mode WHERE value = $${index + 2}))`,
        )
        .join(",")}
        `,
  associatePTR: (nbRows) => `
    INSERT INTO
      front.opt_to_ptr (protocole_transport_id, responsable_id)
    VALUES
      ${new Array(nbRows)
        .fill(null)
        .map(
          (_, index) =>
            `($1, (SELECT id FROM front.protocole_transport_responsable WHERE value = $${index + 2}))`,
        )
        .join(",")}
        `,
  create: `
    INSERT INTO front.org_protocole_transport (
      organisme_id,
      vehicules_adaptes,
      deplacement_durant_sejour,
      precision_mode_organisation,
      precision_vehicules_adaptes
    )
      VALUES ($1, $2, $3, $4, $5)
    RETURNING
      id as "protocoleTransportId"
    ;
    `,
  getByOrganismeId: `
    SELECT 
      vehicules_adaptes AS "vehiculesAdaptes",
      deplacement_durant_sejour AS "deplacementDurantSejour",
      precision_mode_organisation AS "precisionModeOrganisation",
      precision_vehicules_adaptes AS "precisionVehiculesAdaptes",
      COALESCE(
        (SELECT JSON_AGG(ptr.value)
          FROM front.opt_to_ptr pttptr
          LEFT JOIN front.protocole_transport_responsable ptr
            ON pttptr.responsable_id = ptr.id
          WHERE pttptr.protocole_transport_id = pt.id), '[]'
      ) AS "responsableTransportLieuSejour",
      COALESCE(
        (SELECT JSON_AGG(ptm.value)
          FROM front.opt_to_ptm pttptm
          LEFT JOIN front.protocole_transport_mode ptm ON pttptm.mode_transport_id = ptm.id
          WHERE pttptm.protocole_transport_id = pt.id), '[]'
      ) AS "modeTransport"
    FROM front.org_protocole_transport pt
    WHERE organisme_id = $1
  `,
  getIdByOrganiseId: `
    SELECT id
    FROM front.org_protocole_transport
    WHERE organisme_id = $1
  `,
  getPTFiles: `
    SELECT files AS "uuid"
    FROM front.org_protocole_transport_files ptf
    INNER JOIN front.org_protocole_transport pt ON pt.organisme_id = $1
    WHERE ptf.protocole_transport_id = pt.id
`,
  removePTFiles: `
    DELETE FROM front.org_protocole_transport_files
    WHERE
      protocole_transport_id = $1;
  `,
  removePTM: `
    DELETE FROM front.opt_to_ptm
    WHERE
      protocole_transport_id = $1;
  `,
  removePTR: `
    DELETE FROM front.opt_to_ptr
    WHERE
      protocole_transport_id = $1;
  `,
  update: `
    UPDATE front.org_protocole_transport
    SET
      vehicules_adaptes = $2,
      deplacement_durant_sejour = $3,
      precision_mode_organisation = $4,
      precision_vehicules_adaptes = $5
    WHERE
      organisme_id = $1
  `,
};

module.exports.create = async (client, organismeId, parametre) => {
  log.i("create - IN", parametre);

  const response = await client.query(query.create, [
    organismeId,
    parametre?.vehiculesAdaptes ?? null,
    parametre?.deplacementDurantSejour ?? null,
    parametre?.precisionModeOrganisation ?? null,
    parametre?.precisionVehiculesAdaptes ?? null,
  ]);

  log.d("create - DONE");
  return response.rows[0].protocoleTransportId;
};

module.exports.createOrUpdate = async (client, organismeId, parametre) => {
  log.i("update - IN");

  const { rows: protocoleTransport, rowCount } = await client.query(
    query.getIdByOrganiseId,
    [organismeId],
  );
  const protocoleTransportId =
    rowCount === 0
      ? await create(client, organismeId, parametre)
      : protocoleTransport[0].id;

  await client.query(query.update, [
    organismeId,
    parametre?.vehiculesAdaptes ?? null,
    parametre?.deplacementDurantSejour ?? null,
    parametre?.precisionModeOrganisation ?? null,
    parametre?.precisionVehiculesAdaptes ?? null,
  ]);

  await client.query(query.removePTM, [protocoleTransportId]);
  const modeTransport = parametre.modeTransport ?? null;
  if (modeTransport?.length > 0) {
    await client.query(query.associatePTM(modeTransport.length), [
      protocoleTransportId,
      ...modeTransport,
    ]);
  }
  await client.query(query.removePTR, [protocoleTransportId]);
  const responsableTransportLieuSejour =
    parametre.responsableTransportLieuSejour ?? null;
  if (responsableTransportLieuSejour?.length > 0) {
    await client.query(
      query.associatePTR(responsableTransportLieuSejour.length),
      [protocoleTransportId, ...responsableTransportLieuSejour],
    );
  }

  await client.query(query.removePTFiles, [protocoleTransportId]);

  const ptFiles = parametre.files;

  await ptFiles.forEach((ptFile) => {
    client.query(query.associatePTFiles, [
      protocoleTransportId,
      ptFile?.uuid ?? null,
    ]);
  });
  log.i("createOrUpdate - DONE");
};

module.exports.getByOrganismeId = async (organismeId) => {
  log.i("getByOrganismeId - IN", organismeId);
  const { rowCount, rows: protocoleTransport } = await getPool().query(
    query.getByOrganismeId,
    [organismeId],
  );
  const { rows: uuids } = await getPool().query(query.getPTFiles, [
    organismeId,
  ]);
  const files = await Promise.all(
    uuids.map(({ uuid }) => getFileMetaData(uuid) ?? null),
  );
  log.i("getByOrganismeId - DONE");
  return rowCount === 0 ? {} : { ...protocoleTransport[0], files };
};

const { create } = module.exports;
