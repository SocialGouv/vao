import { Inject, Injectable, Logger } from "@nestjs/common";
import { Pool } from "pg";

import { parseData } from "../lib/zodHelper";
import type { User } from "../schemas/user.schema";
import { UserSchema } from "../schemas/user.schema";

@Injectable()
export class UserService {
  constructor(@Inject("PG_CONNECTION") private readonly db: Pool) {}
  private readonly logger = new Logger(UserService.name);

  async findOne(apiToken: User["apiToken"]): Promise<User | null> {
    this.logger.log("User get started");
    const { rows } = await this.db.query(
      `SELECT
        u.id,
        u.mail as "email",
        ak.api_token as "apiToken",
        ak.expires_at as "expiresAt"
        FROM front.users u INNER JOIN front.api_keys ak
        ON u.id = ak.user_id
        WHERE ak.api_token = $1
      `,
      [apiToken],
    );
    if (!rows[0]) {
      this.logger.log("User get ended");
      return null;
    }
    try {
      const data = parseData(rows[0], UserSchema);
      this.logger.log("User get ended", { data });
      return data;
    } catch (error) {
      this.logger.error(rows[0]);
      throw error;
    }
  }
}
