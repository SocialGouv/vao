import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { logger } from "#imports";
import { useAgrementStore } from "~/stores/agrement";

const log = logger("middlewares/load-agrement-context");

type RouteParamValue = string | undefined;

const getAgrementIdParam = (
  params: Record<string, unknown>,
): RouteParamValue => {
  const { agrementId } = params;

  if (typeof agrementId === "string") {
    return agrementId;
  }

  return undefined;
};

const parseAgrementId = (value: RouteParamValue): number | null => {
  if (!value) {
    return null;
  }

  const parsedValue: number = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
};

export default defineNuxtRouteMiddleware(async (to) => {
  log.i("IN");

  const agrementStore = useAgrementStore();

  try {
    if (!agrementStore.agrementCourant) {
      await agrementStore.getCurrent();
    }

    const agrementIdParam: RouteParamValue = getAgrementIdParam(
      to.params as Record<string, unknown>,
    );
    const agrementId: number | null = parseAgrementId(agrementIdParam);

    if (agrementId !== null) {
      const currentEnTraitementId: number | null =
        agrementStore.agrementEnTraitement?.id ?? null;

      if (currentEnTraitementId !== agrementId) {
        const isLoaded: boolean =
          await agrementStore.getEnTraitementById(agrementId);

        if (!isLoaded) {
          log.w("Agrement not found, redirect home", { agrementId });
          return navigateTo("/");
        }
      }

      log.i("DONE with route agrementId", { agrementId });
      return;
    }

    if (!agrementStore.agrementEnTraitement) {
      await agrementStore.getEnRenouvellement();
    }

    log.i("DONE without route agrementId");
  } catch (err: unknown) {
    log.w("FAIL", err);
    return navigateTo("/");
  }
});
