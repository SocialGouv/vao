import { Test } from "@nestjs/testing";
import { Pool } from "pg";

import { UserService } from "./user.service";

describe("UserService", () => {
  let service: UserService;
  let pool: Pool;

  const apiToken = "apiToken";
  const user = {
    apiToken: "apiToken",
    email: "email@email.fr",
    expiresAt: new Date(),
    id: 1,
  };

  beforeEach(async () => {
    const pgMock = {
      query: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: "PG_CONNECTION",
          useValue: pgMock,
        },
      ],
    }).compile();

    service = module.get(UserService);
    pool = module.get("PG_CONNECTION");
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(pool).toBeDefined();
  });

  describe("findOne", () => {
    it("should retrieve organisme by userId", async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [user],
      });

      const result = await service.findOne(apiToken);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        [apiToken],
      );

      expect(result).toEqual(user);
    });

    it("should return null if not find", async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [],
      });

      const result = await service.findOne(apiToken);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        [apiToken],
      );

      expect(result).toBeNull();
    });

    it("should throw an error if parsing fails", async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{}],
      });

      await expect(service.findOne(apiToken)).rejects.toThrow();
    });
  });
});
