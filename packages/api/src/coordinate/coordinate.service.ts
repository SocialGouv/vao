import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import type { AxiosResponse } from "axios";
import { firstValueFrom } from "rxjs";

import type { Feature, FeatureCollection } from "../types/geoCodeJson.type";

@Injectable()
export class CoordinateService {
  constructor(private readonly httpService: HttpService) {}

  async getCoordinate(address: string): Promise<Feature | null> {
    const queryString = encodeURI(address);
    const response: AxiosResponse<FeatureCollection> = await firstValueFrom(
      this.httpService.get<FeatureCollection>(
        `https://api-adresse.data.gouv.fr/search/?q=${queryString}`,
      ),
    );
    return response.data.features[0] || null;
  }
}
