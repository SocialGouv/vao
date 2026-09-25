<template>
  <div class="fr-p-4w">
    <p class="fr-mb-3w">
      Nous avons détecté des informations similaires à votre saisie. Vérifiez
      les éléments suivants avant de poursuivre.
    </p>

    <div v-for="group in groups" :key="group.type" class="fr-mb-3w">
      <h3 class="fr-h4 fr-mb-1w">{{ group.title }}</h3>
      <template v-if="group.type === 'nomLieu'">
        <div class="fr-fieldset__element">
          <ul class="fr-mb-0">
            <li v-for="name in group.names" :key="name">{{ name }}</li>
          </ul>
        </div>
        <div class="fr-fieldset__element">
          <p class="fr-mb-0">
            Votre saisie : <strong>{{ saisieName }}</strong>
          </p>
        </div>
      </template>
      <template v-else>
        <div class="fr-fieldset__element">
          <p class="fr-mb-0">
            Votre saisie : <strong>{{ saisieLabel }}</strong>
          </p>
        </div>
        <div v-if="group.items.length > 1" class="fr-fieldset__element">
          <p class="fr-mb-1v">Saisies similaires :</p>
          <ul class="fr-mb-0">
            <li v-for="item in group.items" :key="item.siteId">
              {{ similarLabel(item) }}
            </li>
          </ul>
        </div>
        <div v-else-if="group.items[0]" class="fr-fieldset__element">
          <p class="fr-mb-0">
            Saisie similaire :
            <strong>{{ similarLabel(group.items[0]) }}</strong>
          </p>
        </div>
      </template>
    </div>

    <div class="fr-btns-group fr-btns-group--inline-md">
      <DsfrButton
        type="button"
        label="Retourner à la saisie"
        primary
        @click="emit('edit')"
      />
      <DsfrButton
        type="button"
        label="Continuer sans modifier"
        secondary
        @click="emit('continue')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  AdresseDto,
  SiteSimilariteResult,
  SiteSimilariteType,
} from "@vao/shared-bridge";

interface SimilarityGroup {
  type: SiteSimilariteType;
  title: string;
  items: SiteSimilariteResult[];
  names: string[];
}

const props = defineProps<{
  saisie: { nomSiteOfficiel: string; adresse: AdresseDto | null };
  similarites: SiteSimilariteResult[];
}>();

const emit = defineEmits<{
  (e: "continue" | "edit"): void;
}>();

const ORDER: SiteSimilariteType[] = [
  "numeroVoie",
  "typeVoie",
  "adresseComplete",
  "nomLieu",
];

const saisieLabel = computed(
  () => props.saisie.adresse?.label ?? props.saisie.nomSiteOfficiel,
);
const saisieName = computed(() => props.saisie.nomSiteOfficiel);

function officialName(similarite: SiteSimilariteResult): string {
  return similarite.nomSiteOfficiel ?? similarite.nomSite ?? "";
}

function similarLabel(similarite: SiteSimilariteResult): string {
  const name = officialName(similarite);
  const address = similarite.adresse?.label ?? "";
  return address ? `${address} (${name})` : name;
}

function byCount(count: number): string {
  return count > 1 ? "par d’autres organismes" : "par un autre organisme";
}

function buildTitle(type: SiteSimilariteType, count: number): string {
  switch (type) {
    case "numeroVoie":
      return `Le numéro de la voie de l’adresse saisie pour cet hébergement est différente de celle renseignée ${byCount(count)}`;
    case "typeVoie":
      return `Le type de voie pour l’adresse saisie pour cet hébergement est différente de celle renseignée ${byCount(count)}`;
    case "adresseComplete":
      return `L’adresse saisie pour cet hébergement est déjà renseignée ${byCount(count)}`;
    case "nomLieu":
      return "Des noms de lieux différents ont été renseignés par d’autres organismes à cette adresse :";
  }
}

const groups = computed<SimilarityGroup[]>(() => {
  const byType = new Map<SiteSimilariteType, SiteSimilariteResult[]>();
  for (const similarite of props.similarites) {
    const items = byType.get(similarite.similarite) ?? [];
    items.push(similarite);
    byType.set(similarite.similarite, items);
  }

  return ORDER.filter((type) => byType.has(type)).map((type) => {
    const items = byType.get(type) ?? [];
    const names =
      type === "nomLieu"
        ? Array.from(
            new Map(
              items.map((item) => {
                const name = officialName(item);
                const address = item.adresse?.label ?? "";
                return [name, address ? `${name} (${address})` : name];
              }),
            ).values(),
          ).filter(Boolean)
        : [];
    return {
      type,
      title: buildTitle(type, items.length),
      items,
      names,
    };
  });
});
</script>
