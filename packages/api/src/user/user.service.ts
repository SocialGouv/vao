import { Inject, Injectable } from "@nestjs/common";
import { Pool } from "pg";

import { parseData } from "../lib/zodHelper";
import type { User } from "../schemas/user.schema";
import { UserSchema } from "../schemas/user.schema";

@Injectable()
export class UserService {
  constructor(@Inject("PG_CONNECTION") private readonly db: Pool) {}

  async findOne(apiToken: User["apiToken"]): Promise<User | null> {
    const { rows } = await this.db.query(
      `SELECT
        u.id,
        u.mail as "email",
        ak.api_token as "apiToken",
        ak.expires_at as "expiresAt"
        FROM front.users u INNER JOIN front.api_keys ak
        ON ak.api_token = $1
      `,
      [apiToken],
    );
    if (!rows[0]) {
      return null;
    }
    return parseData(rows[0], UserSchema);
  }
}
