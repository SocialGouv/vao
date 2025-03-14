import { HttpService } from "@nestjs/axios";
import { Test } from "@nestjs/testing";
import { AxiosResponse } from "axios";

import { Feature, FeatureCollection } from "../types/geoCodeJson.type";
import { CoordinateService } from "./coordinate.service";

describe("CoordinateService", () => {
  let service: CoordinateService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CoordinateService,
        {
          provide: HttpService,
          useValue: {
            axiosRef: {
              get: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get(CoordinateService);
    httpService = module.get(HttpService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(httpService).toBeDefined();
  });

  describe("findOne", () => {
    it("d", async () => {
      const feature: Feature = {
        geometry: {
          coordinates: [2.3522, 48.8566],
          type: "Point",
        },
        properties: {
          city: "Paris",
          citycode: "75056",
          context: "Ile-de-France, France",
          id: "paris-1",
          importance: 0.9,
          label: "Paris",
          name: "Paris",
          postcode: "75000",
          score: 0.9,
          type: "city",
          x: 2.3522,
          y: 48.8566,
        },
        type: "Feature",
      };

      const featureCollection: FeatureCollection = {
        attribution: "GeoService API",
        features: [feature],
        licence: "Open Database Licence (ODbL)",
        limit: 1,
        query: "Paris",
        type: "FeatureCollection",
        version: "1.0",
      };

      const response: AxiosResponse<FeatureCollection> = {
        // @ts-expect-error: config not a good type
        config: undefined,
        data: featureCollection,
        headers: { "Content-Type": "application/json" },
        status: 200,
        statusText: "Ok",
      };

      (httpService.axiosRef.get as jest.Mock).mockResolvedValueOnce(response);

      const result = await service.getCoordinates("paris");

      expect(httpService.axiosRef.get).toHaveBeenCalledWith(
        "https://api-adresse.data.gouv.fr/search/?q=paris",
      );

      expect(result).toEqual(feature);
    });
  });
});
