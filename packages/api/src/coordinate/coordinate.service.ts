import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import type { AxiosResponse } from "axios";

import type { Feature, FeatureCollection } from "../types/geoCodeJson.type";

@Injectable()
export class CoordinateService {
  constructor(private readonly httpService: HttpService) {}
  private readonly logger = new Logger(CoordinateService.name);

  async getCoordinates(address: string): Promise<Feature | null> {
    this.logger.log("coordinates get started");
    const queryString = encodeURI(address);
    const response: AxiosResponse<FeatureCollection> =
      await this.httpService.axiosRef.get<FeatureCollection>(
        `https://api-adresse.data.gouv.fr/search/?q=${queryString}`,
      );
    this.logger.log("coordinates get ended");
    return response.data.features[0] || null;
  }
}
