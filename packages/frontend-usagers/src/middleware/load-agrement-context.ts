import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { logger } from "#imports";
import { useAgrementStore } from "~/stores/agrement";

const log = logger("middlewares/load-agrement-context");

type RouteParamValue = string | string[] | undefined;

const parseAgrementId = (value: RouteParamValue): number | null => {
  const rawValue: string | undefined = Array.isArray(value) ? value[0] : value;

  if (!rawValue) {
    return null;
  }

  const parsedValue: number = Number(rawValue);

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

    const agrementId: number | null = parseAgrementId(
      to.params.agrementId as RouteParamValue,
    );

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
