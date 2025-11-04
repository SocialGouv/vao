import { AgrementsDto } from "../../dto/AgrementsDto";
import Logger from "../../utils/logger";
import { getPool } from "../../utils/pgpool";

const log = Logger(module.filename);

const pool = getPool();

export const AgrementsRepository = {
  getByOrganismeId: async ({
    organismeId,
    withDetails,
  }: {
    organismeId: number;
    withDetails: boolean;
  }): Promise<AgrementsDto> => {
    log.i("getByOrganismeId - IN");

    const query = () => `
        SELECT
            agr.*
        ${withDetails ? "json_object(activite_id, act.code, act.libelle, activite_type, created_at, updated_at) AS agrement_animation" : ""}
        FROM
        front.agrements agr
        ${
          withDetails
            ? `LEFT JOIN front.agrement_animation ani ON ani.agrement_id = agr.id\n
               LEFT JOIN front.activite act ON act.id = ani.activite_id`
            : ""
        }
        WHERE
            agr.organisme_id = $1
        `;
    const response = await pool.query(query(), [organismeId]);
    log.i("getByOrganismeId - DONE");

    return response.rows[0];
  },
};
