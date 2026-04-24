import { pool } from "../../db";
import { STATUS_USER_FRONT } from "@vao/shared-bridge";

export const OrganismesRepositoryShared = {
  async getListMailByOrganismesId({
    id,
  }: {
    id: number;
  }): Promise<{ mail: string }[]> {
    const query = `
      select mail
      FROM front.users u
      INNER JOIN front.user_organisme uo
        ON uo.use_id = u.id AND uo.org_id = $1
          AND u.status_code = '${STATUS_USER_FRONT.VALIDATED}'
`;
    const result = await pool.query(query, [id]);
    return result.rows;
  },
};
