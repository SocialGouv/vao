import { useHead } from "nuxt/app";
import { computed, type Ref } from "vue";

interface UseAgrementPageTitleOptions {
  agrementNumero: Ref<string | undefined | null>;
  agrementLabel: string; // "Mon agrément" ou "Agrément"
  appSuffix: string; // "Vacances Adaptées Organisées" ou "Portail Administration | VAO"
  selectedTabIndex: Ref<number>;
}

const TAB_PAGE_TITLES = [
  "Dossier",
  "Documents joints",
  "Historique",
  "Messagerie",
] as const;

export function useAgrementPageTitle({
  agrementNumero,
  agrementLabel,
  appSuffix,
  selectedTabIndex,
}: UseAgrementPageTitleOptions) {
  const pageTitle = computed(() => {
    const label = TAB_PAGE_TITLES[selectedTabIndex.value] ?? "";

    const agrement = agrementNumero.value
      ? `${agrementLabel} n° ${agrementNumero.value}`
      : agrementLabel;

    return `${agrement} | ${label} | ${appSuffix}`;
  });

  useHead({
    title: () => pageTitle.value, // ← getter () => string, accepté nativement par Unhead
  });
}