import { Inject, Injectable, Logger } from "@nestjs/common";
import { Pool } from "pg";

import { parseData } from "../lib/zodHelper";
import {
  Address,
  AddressSchema,
  CreateAddress,
} from "../schemas/address.schema";

@Injectable()
export class AddressService {
  constructor(@Inject("PG_CONNECTION") private readonly db: Pool) {}

  private readonly logger = new Logger(AddressService.name);

  async findByInseeKeyOrLabel(
    inseeKey: Address["inseeKey"],
    label: Address["label"],
  ): Promise<Address | null> {
    const { rows } = await this.db.query(
      `
      SELECT
        departement AS "department",
        id,
        code_insee AS "inseeCode",
        cle_insee AS "inseeKey",
        label,
        lat,
        long,
        code_postal AS "postalCode"
      FROM
        FRONT.ADRESSE
      WHERE
        CLE_INSEE = $1
        OR LABEL = $2;
      `,
      [inseeKey, label],
    );
    if (!rows.length) {
      return null;
    }
    try {
      return parseData(rows[0], AddressSchema);
    } catch (error) {
      this.logger.error(rows[0]);
      throw error;
    }
  }

  async create(address: CreateAddress): Promise<Address> {
    const addressSaved = await this.findByInseeKeyOrLabel(
      address.inseeKey,
      address.label,
    );
    if (addressSaved) {
      return addressSaved;
    }
    const { rows } = await this.db.query(
      `
      INSERT INTO
        FRONT.ADRESSE (
          CLE_INSEE,
          LABEL,
          CODE_INSEE,
          CODE_POSTAL,
          LONG,
          LAT,
          DEPARTEMENT
        )
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        departement AS "department",
        id,
        code_insee AS "inseeCode",
        cle_insee AS "inseeKey",
        label,
        lat,
        long,
        code_postal AS "postalCode";
      `,
      [
        address.inseeKey,
        address.label,
        address.inseeCode,
        address.postalCode,
        address.long,
        address.lat,
        address.department,
      ],
    );

    try {
      return parseData(rows[0], AddressSchema);
    } catch (error) {
      this.logger.error(rows[0]);
      throw error;
    }
  }
}
