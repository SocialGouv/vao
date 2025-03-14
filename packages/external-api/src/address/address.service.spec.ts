import { Test } from "@nestjs/testing";
import { Pool } from "pg";

import { AddressService } from "./address.service";

describe("AddressService", () => {
  let service: AddressService;
  let pool: Pool;

  const address = {
    department: "department",
    inseeCode: "inseeCode",
    inseeKey: "inseeKey",
    label: "label",
    lat: 1,
    long: 1,
    postalCode: "postalCode",
  };

  beforeEach(async () => {
    const pgMock = {
      query: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        AddressService,
        {
          provide: "PG_CONNECTION",
          useValue: pgMock,
        },
      ],
    }).compile();

    service = module.get(AddressService);
    pool = module.get("PG_CONNECTION");
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(pool).toBeDefined();
  });

  describe("save", () => {
    it("should insert services and return the result", async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [],
      });
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ ...address, id: 1 }],
      });

      const result = await service.save(address);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT"),
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

      expect(result).toEqual({ ...address, id: 1 });
    });

    it("should throw an error if parsing fails", async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [],
      });
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{}],
      });

      await expect(service.save(address)).rejects.toThrow();
    });
  });
});
