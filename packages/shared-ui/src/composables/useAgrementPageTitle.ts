import { useHead } from "nuxt/app";
import { computed, type Ref } from "vue";

interface UseAgrementPageTitleOptions {
  agrementNumero: Ref<string | undefined | null>;
  agrementLabel: "Mon agrément" | "Agrément";
  appSuffix: "Vacances Adaptées Organisées" | "Portail Administration | VAO";
  selectedTabIndex: Ref<number>;
  tabPageTitles: readonly string[];
}

const DEFAULT_TAB_TITLES = [
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
  tabPageTitles,
}: UseAgrementPageTitleOptions) {
  const pageTitle = computed(() => {
    const titles = tabPageTitles ?? DEFAULT_TAB_TITLES;
    const label = titles[selectedTabIndex.value] ?? "";

    const agrement = agrementNumero.value
      ? `${agrementLabel} n° ${agrementNumero.value}`
      : agrementLabel;

    return `${agrement} | ${label} | ${appSuffix}`;
  });

  useHead({
    title: () => pageTitle.value,
  });
}
