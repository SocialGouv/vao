import { Test } from "@nestjs/testing";

import { HealthController } from "./health.controller";

describe("FileController", () => {
  let healthController: HealthController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    healthController = module.get(HealthController);
  });

  it("should be defined", () => {
    expect(healthController).toBeDefined();
  });

  it('should return 200 and { status: "ok" }', async () => {
    const result = await healthController.healthCheck();
    expect(result).toEqual({ status: "ok" });
  });
});
