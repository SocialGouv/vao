import { Inject, Injectable, Logger } from "@nestjs/common";
import { Pool } from "pg";

import { parseData } from "../lib/zodHelper";
import { Address, AddressSchema, SaveAddress } from "../schemas/address.schema";
import { Feature } from "../types/geoCodeJson.type";

@Injectable()
export class AddressService {
  constructor(@Inject("PG_CONNECTION") private readonly db: Pool) {}

  private readonly logger = new Logger(AddressService.name);

  async findByInseeKeyOrLabel(
    inseeKey: Address["inseeKey"],
    label: Address["label"],
  ): Promise<Address | null> {
    this.logger.log("Address getByInseeKeyOrLabel started");
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
      this.logger.log("Address getByInseeKeyOrLabel ended");
      return null;
    }
    try {
      const address = parseData(rows[0], AddressSchema);
      this.logger.log("Address getByInseeKeyOrLabel ended");
      return address;
    } catch (error) {
      this.logger.error(rows[0]);
      throw error;
    }
  }

  async save(address: SaveAddress): Promise<Address> {
    this.logger.log("Address save started");
    const addressSaved = await this.findByInseeKeyOrLabel(
      address.inseeKey,
      address.label,
    );
    if (addressSaved) {
      this.logger.log("Address save ended");
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
      const address = parseData(rows[0], AddressSchema);
      this.logger.log("Address save ended");
      return address;
    } catch (error) {
      this.logger.error(rows[0]);
      throw error;
    }
  }

  createFromCoordinates(coordinate: Feature) {
    return {
      department: coordinate.properties.context.substring(0, 2),
      inseeCode: coordinate.properties.citycode,
      inseeKey: coordinate.properties.id,
      label: coordinate.properties.label,
      lat: coordinate.geometry.coordinates[0],
      long: coordinate.geometry.coordinates[0],
      postalCode: coordinate.properties.postcode,
    };
  }
}
