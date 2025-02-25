import { Inject, Injectable, Logger } from "@nestjs/common";
import { Pool } from "pg";

import { parseData } from "../lib/zodHelper";
import type { Accommodation } from "../schemas/accommodation.schema";
import {
  HotelServicesSchema,
  HotelsService,
} from "../schemas/hotelService.schema";

@Injectable()
export class HotelServiceService {
  constructor(@Inject("PG_CONNECTION") private readonly db: Pool) {}
  private readonly logger = new Logger(HotelServiceService.name);

  async save(
    accommodationId: Accommodation["id"],
    services: HotelsService,
  ): Promise<HotelsService> {
    this.logger.log("HotelService save started");
    const { rows } = await this.db.query(
      `
        WITH inserted AS (
          INSERT INTO front.hebergement_to_prestations_hotelieres (hebergement_id, prestation_id)
          SELECT
            $1 AS hebergement_id, -- ID de l'hébergement
            hph.id                -- ID de la prestation
          FROM
            front.hebergement_prestations_hotelieres hph
          WHERE
            hph.value = ANY($2::text[]) -- Tableau de valeurs
          RETURNING prestation_id
        )
        SELECT
          $2::text[] AS "hotelServices";
      `,
      [accommodationId, services],
    );
    try {
      return parseData(rows[0].hotelServices, HotelServicesSchema);
    } catch (error) {
      this.logger.error(rows[0]);
      throw error;
    }
  }

  async findByAccommodationId(
    accommodationId: Accommodation["id"],
  ): Promise<HotelsService | null> {
    const { rows } = await this.db.query(
      `
      SELECT
        COALESCE(array_agg(hph.value), ARRAY[]::text[]) as "hotelServices"
      FROM
        front.hebergement_to_prestations_hotelieres htp
      JOIN
        front.hebergement_prestations_hotelieres hph
      ON
        htp.prestation_id = hph.id
      WHERE
        htp.hebergement_id = $1;
      `,
      [accommodationId],
    );
    if (!rows.length) {
      this.logger.log("HotelService findByAccommodationId ended");
      return null;
    }
    try {
      const hostelService = parseData(
        rows[0].hotelServices,
        HotelServicesSchema,
      );
      this.logger.log("HotelService findByAccommodationId ended");
      return hostelService;
    } catch (error) {
      this.logger.error(rows[0]);
      throw error;
    }
  }
}
