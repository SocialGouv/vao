import { Inject, Injectable } from "@nestjs/common";
import { Pool } from "pg";

import { parseData } from "../lib/zodHelper";
import type { Organisme } from "../schemas/organisme.schema";
import { OrganismeSchema } from "../schemas/organisme.schema";
import type { User } from "../schemas/user.schema";

@Injectable()
export class OrganismeService {
  constructor(@Inject("PG_CONNECTION") private readonly db: Pool) {}

  async findOne(userId: User["id"]): Promise<Organisme | null> {
    const { rows } = await this.db.query(
      `SELECT
        org_id as "id"
      FROM front.user_organisme WHERE use_id = $1`,
      [userId],
    );
    if (!rows[0]) {
      return null;
    }
    return parseData(rows[0], OrganismeSchema);
  }
}
