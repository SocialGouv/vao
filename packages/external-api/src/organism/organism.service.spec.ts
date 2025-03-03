import { Test } from "@nestjs/testing";
import { Pool } from "pg";

import { OrganismService } from "./organism.service";

describe("OrganismService", () => {
  let service: OrganismService;
  let pool: Pool;

  const userId = 123;

  beforeEach(async () => {
    const pgMock = {
      query: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        OrganismService,
        {
          provide: "PG_CONNECTION",
          useValue: pgMock,
        },
      ],
    }).compile();

    service = module.get(OrganismService);
    pool = module.get("PG_CONNECTION");
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(pool).toBeDefined();
  });

  describe("findOne", () => {
    it("should retrieve user by apiToken", async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: 22,
          },
        ],
      });

      const result = await service.findOne(userId);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        [userId],
      );

      expect(result).toEqual({ id: 22 });
    });

    it("should return null if not find", async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [],
      });

      const result = await service.findOne(userId);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        [userId],
      );

      expect(result).toBeNull();
    });

    it("should throw an error if parsing fails", async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{}],
      });

      await expect(service.findOne(userId)).rejects.toThrow();
    });
  });
});
