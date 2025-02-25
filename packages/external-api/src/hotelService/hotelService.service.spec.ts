import { Test } from "@nestjs/testing";
import { Pool } from "pg";

import { HotelServiceService } from "./hotelService.service";

describe("HotelServiceService", () => {
  let service: HotelServiceService;
  let pool: Pool;

  const services: ("blanchisseries" | "entretien_locaux")[] = [
    "blanchisseries",
    "entretien_locaux",
  ];
  const accommodationId = 123;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        HotelServiceService,
        {
          provide: "PG_CONNECTION",
          useValue: {
            query: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(HotelServiceService);
    pool = module.get("PG_CONNECTION");
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(pool).toBeDefined();
  });

  describe("save", () => {
    it("should insert services and return the result", async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            hotelServices: services,
          },
        ],
      });

      const result = await service.save(accommodationId, services);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining(
          "INSERT INTO front.hebergement_to_prestations_hotelieres",
        ),
        [accommodationId, services],
      );

      expect(result).toEqual(["blanchisseries", "entretien_locaux"]);
    });

    it("should throw an error if parsing fails", async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{}],
      });

      await expect(service.save(accommodationId, services)).rejects.toThrow();
    });
  });

  describe("findByAccommodationId", () => {
    it("should retrieve services by accommodation ID", async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            hotelServices: services,
          },
        ],
      });

      const result = await service.findByAccommodationId(accommodationId);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        [accommodationId],
      );

      expect(result).toEqual(["blanchisseries", "entretien_locaux"]);
    });

    it("should return null if not find", async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [],
      });

      const result = await service.findByAccommodationId(accommodationId);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        [accommodationId],
      );

      expect(result).toBeNull();
    });

    it("should throw an error if parsing fails", async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{}],
      });

      await expect(
        service.findByAccommodationId(accommodationId),
      ).rejects.toThrow();
    });
  });
});
