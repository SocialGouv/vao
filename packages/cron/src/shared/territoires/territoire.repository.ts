import { pool } from "../../db";
import { FicheTerritoire } from "./territoire.type";

export const TerritoireRepositoryShared = {
  async getByTerCode(terCode: string): Promise<FicheTerritoire> {
    const query = `
      select
        ft.id,
        ft.service_mail,
        ft.service_telephone,
        ft.corresp_vao_nom,
        ft.corresp_vao_prenom,
        ft.ter_code,
        t.label
      FROM back.fiche_territoire ft
      INNER JOIN geo.territoires t ON t.code = ft.ter_code
      WHERE ft.ter_code = $1`;
    const result = await pool.query(query, [terCode]);
    return result.rows[0];
  },
};
