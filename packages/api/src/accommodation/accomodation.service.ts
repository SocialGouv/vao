import { Inject, Injectable } from "@nestjs/common";
import { Pool } from "pg";

import { parseData } from "../lib/zodHelper";
import type {
  Accomodation,
  CreateAccomodation,
} from "../schemas/accomodation.schema";
import { AccomodationSchema } from "../schemas/accomodation.schema";
import type { Organisme } from "../schemas/organisme.schema";
import type { User } from "../schemas/user.schema";

@Injectable()
export class AccomodationService {
  constructor(@Inject("PG_CONNECTION") private readonly db: Pool) {}

  async create(
    accomodation: CreateAccomodation,
    userId: User["id"],
    organismeId: Organisme["id"],
  ): Promise<Accomodation> {
    const { rows } = await this.db.query("INSERT INTO", [
      accomodation,
      organismeId,
      userId,
    ]);
    return parseData(rows, AccomodationSchema);
  }
}
