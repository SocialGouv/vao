import { FeatureFlagName } from "@vao/shared-bridge";

import { FeatureFlagRepository } from "../repositories/shared/featureFlagRepositories";
import { FeatureFlagService } from "./featureFlagService";

describe("featureFlagService", () => {
  describe("isFeatureAvailable", () => {
    it("should return false if feature does not exist", async () => {
      jest
        .spyOn(FeatureFlagRepository, "findOneByName")
        .mockResolvedValueOnce(null);
      const result = await FeatureFlagService.isFeatureAvailable(
        "nonExistentFeature" as FeatureFlagName,
      );
      expect(result).toBe(false);
    });

    it("should return true if feature is enabled", async () => {
      jest.spyOn(FeatureFlagRepository, "findOneByName").mockResolvedValueOnce({
        createdAt: new Date(),
        dateFrom: null,
        dateTo: null,
        description: "",
        enabled: true,
        name: "enabledFeature",
        updatedAt: new Date(),
      });
      const result = await FeatureFlagService.isFeatureAvailable(
        "enabledFeature" as any,
      );
      expect(result).toBe(true);
    });

    it("should return true if feature is within date range", async () => {
      const from = new Date(Date.now() - 1000 * 60 * 60);
      const to = new Date(Date.now() + 1000 * 60 * 60);
      jest.spyOn(FeatureFlagRepository, "findOneByName").mockResolvedValueOnce({
        createdAt: new Date(),
        dateFrom: from,
        dateTo: to,
        description: "",
        enabled: false,
        name: "dateFeature",
        updatedAt: new Date(),
      });
      const result = await FeatureFlagService.isFeatureAvailable(
        "dateFeature" as any,
      );
      expect(result).toBe(true);
    });

    it("should return false if feature is outside date range", async () => {
      const from = new Date(Date.now() - 1000 * 60 * 60 * 2);
      const to = new Date(Date.now() - 1000 * 60 * 60);
      jest.spyOn(FeatureFlagRepository, "findOneByName").mockResolvedValueOnce({
        createdAt: new Date(),
        dateFrom: from,
        dateTo: to,
        description: "",
        enabled: false,
        name: "dateFeature",
        updatedAt: new Date(),
      });
      const result = await FeatureFlagService.isFeatureAvailable(
        "dateFeature" as any,
      );
      expect(result).toBe(false);
    });
  });

  describe("getFeatureFlagsAvailable", () => {
    it("should return an empty object if no features are available", async () => {
      jest.spyOn(FeatureFlagRepository, "findAll").mockResolvedValueOnce([
        {
          createdAt: new Date(),
          dateFrom: null,
          dateTo: null,
          description: "",
          enabled: false,
          name: "disabledFeature",
          updatedAt: new Date(),
        },
      ]);
      const result = await FeatureFlagService.getFeatureFlagsAvailable();
      expect(result).toEqual({});
    });

    it("should return an object with available features", async () => {
      const from = new Date(Date.now() - 1000 * 60 * 60);
      const to = new Date(Date.now() + 1000 * 60 * 60);
      jest.spyOn(FeatureFlagRepository, "findAll").mockResolvedValueOnce([
        {
          createdAt: new Date(),
          dateFrom: null,
          dateTo: null,
          description: "",
          enabled: true,
          name: "enabledFeature",
          updatedAt: new Date(),
        },
        {
          createdAt: new Date(),
          dateFrom: from,
          dateTo: to,
          description: "",
          enabled: false,
          name: "dateFeature",
          updatedAt: new Date(),
        },
      ]);
      const result = await FeatureFlagService.getFeatureFlagsAvailable();
      expect(result).toEqual({ dateFeature: true, enabledFeature: true });
    });
  });
});
