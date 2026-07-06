import { useAgrementStore } from "~/stores/agrement";
import { useOrganismeStore } from "~/stores/organisme";

export async function loadAgrementDetectionState() {
  const agrementStore = useAgrementStore();
  const organismeStore = useOrganismeStore();

  if (!agrementStore.agrementCourant) {
    await agrementStore.getCurrent();
  }
  if (agrementStore.agrements === null) {
    await agrementStore.fetchAgrementStatus();
  }

  const hasLegacyAgrement = Boolean(organismeStore.organismeCourant?.agrement);

  return {
    hasAgrementValide: agrementStore.hasAgrementValide,
    hasAgrementEnCours: agrementStore.hasAgrementEnCours,
    hasLegacyAgrement,
    hasAnyAgrement:
      agrementStore.hasAgrementValide ||
      agrementStore.hasAgrementEnCours ||
      hasLegacyAgrement,
  };
}
