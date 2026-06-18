import type { FeatureFlagDto, FeatureFlagName } from "@vao/shared-bridge";

import { FeatureFlagRepository } from "../repositories/shared/featureFlagRepositories";

const checkFeatureAvailable = (feature?: FeatureFlagDto | null) => {
  if (!feature) {
    return false;
  }
  const now = new Date();
  const isBetween =
    feature.dateFrom != null &&
    feature.dateTo != null &&
    feature.dateFrom <= now &&
    feature.dateTo >= now;
  return !!(feature.enabled || isBetween);
};

const isFeatureAvailable = async (featureName: FeatureFlagName) => {
  const feature = await FeatureFlagRepository.findOneByName(featureName);
  return checkFeatureAvailable(feature);
};

const getFeatureFlagsAvailable = async (): Promise<{
  [key: string]: boolean;
}> => {
  const features = await FeatureFlagRepository.findAll();
  return features.reduce<{ [key: string]: boolean }>((acc, feature) => {
    if (checkFeatureAvailable(feature)) {
      acc[feature.name] = true;
    }
    return acc;
  }, {});
};

export const FeatureFlagService = {
  getFeatureFlagsAvailable,
  isFeatureAvailable,
};
