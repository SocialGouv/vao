import Logger from "../../utils/logger";
import { getPool } from "../../utils/pgpool";

const log = Logger(module.filename);

const pool = getPool();

export const AgrementsRepository = {
  getByOrganismeId: async ({ organismeId }: { organismeId: number }) => {
    log.i("getByOrganismeId - IN");

    const query = () => `
        SELECT
            *
        FROM
        front.agrements agr
        WHERE
            agr.organisme_id = $1
        `;
    const response = await pool.query(query(), [organismeId]);
    log.i("getAdminStats - DONE");

    return {
      agrement: response.rows[0],
    };
  },
};
