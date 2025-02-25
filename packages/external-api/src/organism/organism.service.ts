import { Inject, Injectable, Logger } from "@nestjs/common";
import { Pool } from "pg";

import { parseData } from "../lib/zodHelper";
import type { Organism } from "../schemas/organism.schema";
import { OrganismSchema } from "../schemas/organism.schema";
import type { User } from "../schemas/user.schema";

@Injectable()
export class OrganismService {
  constructor(@Inject("PG_CONNECTION") private readonly db: Pool) {}
  private readonly logger = new Logger(OrganismService.name);

  async findOne(userId: User["id"]): Promise<Organism | null> {
    this.logger.log("Organism get started", { userId });
    const { rows } = await this.db.query(
      `SELECT
        org_id as "id"
      FROM front.user_organisme WHERE use_id = $1`,
      [userId],
    );
    if (!rows[0]) {
      this.logger.log("Organism get ended", { userId });
      return null;
    }
    try {
      const organism = parseData(rows[0], OrganismSchema);
      this.logger.log("Organism get ended", { userId });
      return organism;
    } catch (error) {
      this.logger.error(rows[0]);
      throw error;
    }
  }
}
