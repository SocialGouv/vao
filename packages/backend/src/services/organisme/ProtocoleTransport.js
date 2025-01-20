const logger = require("../../utils/logger");

const pool = require("../../utils/pgpool").getPool();

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
  getIdByOrganiseId: `
    SELECT id
    FROM front.org_protocole_transport
    WHERE organisme_id = $1
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

module.exports.createOrUpdate = async (organismeId, parametre) => {
  log.i("update - IN");

  const { rows: protocoleTransport, rowCount } = await pool.query(
    query.getIdByOrganiseId,
    [organismeId],
  );
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

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
    const modeTransport = parametre.modeTransport;
    if (modeTransport.length > 0) {
      await client.query(query.associatePTM(modeTransport.length), [
        protocoleTransportId,
        ...modeTransport,
      ]);
    }

    await client.query(query.removePTR, [protocoleTransportId]);
    const responsableTransportLieuSejour =
      parametre.responsableTransportLieuSejour;
    if (responsableTransportLieuSejour.length > 0) {
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

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
  log.i("createOrUpdate - DONE");
};

const { create } = module.exports;
