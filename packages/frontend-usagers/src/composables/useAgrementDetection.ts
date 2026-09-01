import { useAgrementStore } from "~/stores/agrement";
import { useOrganismeStore } from "~/stores/organisme";

export async function loadAgrementDetectionState() {
  const agrementStore = useAgrementStore();
  const organismeStore = useOrganismeStore();

  if (agrementStore.agrements === null) {
    await agrementStore.getCurrent(organismeStore.organismeCourant);
  }

  const hasLegacyAgrement = Boolean(organismeStore.organismeCourant?.agrement);

  return {
    hasAgrementValide: agrementStore.hasAgrementValide,
    hasAgrementRenouvellementEnCours:
      agrementStore.hasAgrementRenouvellementEnCours,
    hasLegacyAgrement,
    hasAnyAgrement:
      agrementStore.hasAgrementValide ||
      agrementStore.hasAgrementRenouvellementEnCours ||
      hasLegacyAgrement,
  };
}
