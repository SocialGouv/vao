import type { DroitDomain } from "../helpers/droits";
import BoUser from "../services/BoUser";
import { logger } from "../utils/logger";

const log = logger(module.filename);

type AccessChecker = (
  // eslint-disable-next-line no-unused-vars
  resourceId: number | string,
  // eslint-disable-next-line no-unused-vars
  userId: number | string,
) => Promise<unknown>;

const accessCheckers: Partial<Record<DroitDomain, AccessChecker>> = {
  agrement: (resourceId, userId) =>
    BoUser.isAllowToAccessAgrement(resourceId, userId),
  demande_sejour: (resourceId, userId) =>
    BoUser.isAllowToAccessDemandeSejour(resourceId, userId),
  hebergement: (resourceId, userId) =>
    BoUser.isAllowToAccessHebergement(resourceId, userId),
};

export async function isUserAllowedForDroit(
  droit: DroitDomain,
  resourceId: number | string,
  userId: number | string,
): Promise<boolean> {
  const checker = accessCheckers[droit];
  if (!checker) {
    log.w(`Aucun vérificateur d'accès pour le domaine de droit: ${droit}`);
    return false;
  }
  return (await checker(resourceId, userId)) === true;
}
