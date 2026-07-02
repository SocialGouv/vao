import { useAgrementStore } from "~/stores/agrement";
import { AGREMENT_STATUT } from "@vao/shared-bridge";
import { logger } from "#imports";
import { navigateTo, defineNuxtRouteMiddleware } from "#app";

const log = logger("middlewares/check-agrement-readonly-statut");

export default defineNuxtRouteMiddleware(async (to) => {
  log.i("IN");

  const paramsAgrementId = to.params?.agrementId;
  if (paramsAgrementId === undefined) {
    log.w("No agrementId in route params, back to home");
    return navigateTo("/");
  } else {
    if (paramsAgrementId === "new") {
      return;
    }
  }
  const agrementStore = useAgrementStore();
  const agrementStatutModification = [
    AGREMENT_STATUT.BROUILLON,
    AGREMENT_STATUT.A_COMPLETER,
    AGREMENT_STATUT.A_CORRIGER,
  ];

  if (
    !agrementStore.agrementEnTraitement ||
    !agrementStatutModification.includes(
      agrementStore.agrementEnTraitement.statut!,
    )
  ) {
    log.w("Agrement is on read only mode, back to home");
    return navigateTo("/");
  }
  log.i("DONE");
});
