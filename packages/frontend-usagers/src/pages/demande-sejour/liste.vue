<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div class="fr-col">
        <DsfrBreadcrumb :links="links" />
      </div>
    </div>

    <div class="fr-grid-row">
      <div class="fr-col">
        <h1>Liste des déclarations de séjour</h1>
      </div>
    </div>
    <template v-if="demandeSejourStore.demandes.length">
      <div class="fr-grid-row">
        <div class="fr-col">
          <form>
            <fieldset class="fr-fieldset">
              <div
                class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
              >
                <div class="fr-input-group">
                  <label class="fr-label">ID</label>
                  <Multiselect
                    :model-value="search.declarationId"
                    name="id"
                    mode="tags"
                    :searchable="true"
                    :close-on-select="false"
                    :options="idOptions"
                    @update:model-value="onUpdateId"
                  >
                    <template #option="{ option, isPointed }">
                      <MultiSelectOption
                        :label="option.label.toString()"
                        :is-pointed="isPointed(option)"
                      />
                    </template>
                  </Multiselect>
                </div>
              </div>
              <div
                class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
              >
                <div class="fr-input-group">
                  <label class="fr-label"> N° enregistrement </label>
                  <Multiselect
                    :model-value="search.idFonctionnelle"
                    name="idFonctionnelle"
                    mode="tags"
                    :searchable="true"
                    :close-on-select="false"
                    :options="idFonctionnellesOptions"
                    @update:model-value="onUpdateIdFonctionnelle"
                  >
                    <template #option="{ option, isPointed }">
                      <MultiSelectOption
                        :label="`${option.label}`"
                        :is-pointed="isPointed(option)"
                      />
                    </template>
                  </Multiselect>
                </div>
              </div>
              <div
                class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
              >
                <div class="fr-input-group">
                  <label class="fr-label">SIRET déclarant</label>
                  <Multiselect
                    :model-value="search.siret"
                    name="siret"
                    mode="tags"
                    :searchable="true"
                    :close-on-select="false"
                    :options="siretOptions"
                    @update:model-value="onUpdateSiret"
                  >
                    <template #option="{ option, isPointed }">
                      <MultiSelectOption
                        :label="`${option.label}`"
                        :is-pointed="isPointed(option)"
                      />
                    </template>
                  </Multiselect>
                </div>
              </div>

              <div
                class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
              >
                <div class="fr-input-group">
                  <label class="fr-label"> Département d'instruction </label>
                  <Multiselect
                    :model-value="search.departementSuivi"
                    :searchable="true"
                    :close-on-select="false"
                    value-prop="value"
                    label="label"
                    mode="tags"
                    :options="departementOptions"
                    @update:model-value="onUpdateDepartement"
                  >
                    <template #option="{ option, isPointed }">
                      <MultiSelectOption
                        :label="option.label"
                        :is-pointed="isPointed(option)"
                      />
                    </template>
                  </Multiselect>
                </div>
              </div>
              <div
                class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
              >
                <div class="fr-input-group">
                  <label class="fr-label"> Statut</label>
                  <Multiselect
                    :model-value="search.statut"
                    :hide-selected="true"
                    :searchable="true"
                    :close-on-select="false"
                    mode="tags"
                    name="statut"
                    :options="statutOptions"
                    @update:model-value="onUpdateStatut"
                  >
                    <template #option="{ option, isPointed }">
                      <MultiSelectOption
                        :label="`${option.label}`"
                        :is-pointed="isPointed(option)"
                      />
                    </template>
                  </Multiselect>
                </div>
              </div>
              <div
                class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
              >
                <div class="fr-input-group">
                  <label class="fr-label"> Saison</label>
                  <Multiselect
                    :model-value="search.periode"
                    :hide-selected="true"
                    :searchable="false"
                    :close-on-select="false"
                    mode="tags"
                    name="saison"
                    :options="saisonOptions"
                    @update:model-value="onUpdateSaison"
                  >
                    <template #option="{ option, isPointed }">
                      <MultiSelectOption
                        :label="`${option.label}`"
                        :is-pointed="isPointed(option)"
                      />
                    </template>
                  </Multiselect>
                </div>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
      <div class="fr-grid-row">
        <div class="fr-col">
          <UtilsTableFull
            :headers="headers"
            :data="demandeSejourStore.demandes"
            :search="search"
            @click-row="navigate"
          ></UtilsTableFull>
        </div>
      </div>
    </template>
    <p v-else>Aucune demande de séjour déclarée actuellement</p>
    <div class="fr-grid-row">
      <div class="fr-col">
        <form>
          <fieldset class="fr-fieldset">
            <DsfrButton type="button">
              <NuxtLink to="/demande-sejour">
                Déclarer un nouveau séjour
              </NuxtLink>
            </DsfrButton>
          </fieldset>
        </form>
      </div>
    </div>
  </div>
</template>
<script setup>
import dayjs from "dayjs";
import Multiselect from "@vueform/multiselect";
const NuxtLink = resolveComponent("NuxtLink");
const DsfrBadge = resolveComponent("DsfrBadge");
const DsfrButtonGroup = resolveComponent("DsfrButtonGroup");
import "@vueform/multiselect/themes/default.css";
import { useDepartementStore } from "~/stores/referentiels";
import { useDemandeSejourStore } from "~/stores/demande-sejour";
import { DeclarationSejour } from "#imports";
import MultiSelectOption from "~/components/utils/MultiSelectOption.vue";

const log = logger("pages/demande-sejour/liste");
const toaster = useToaster();

definePageMeta({
  middleware: ["is-connected", "check-organisme-is-complet"],
});

const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    text: "Liste des déclarations",
  },
];

useHead({
  title: "Mes déclarations de séjour | Vacances Adaptées Organisées",
  meta: [
    {
      name: "description",
      content: "Page listant les déclarations de séjour.",
    },
  ],
});

const navigate = (item) => {
  navigateTo(`/demande-sejour/${item.declarationId}`);
};

const route = useRoute();
const departementStore = useDepartementStore();

const saisonOptions = computed(() => {
  return demandeSejourStore.demandes.reduce((acc, elem) => {
    if (elem.periode) {
      acc.push(elem);
    }
    return acc;
  }, []);
});

const saisons = DeclarationSejour.saisons.map((saison) =>
  saison.toLocaleLowerCase(),
);

const search = reactive({
  declarationId:
    route.query.declarationId
      ?.split(",")
      ?.flatMap((id) => (isNaN(id) ? [] : [parseInt(id, 10)])) ?? null,
  idFonctionnelle: route.query.idFonctionnelle?.split(",") ?? null,
  siret: route.query.siret?.split(",") ?? null,
  statut: route.query.statut
    ? route.query.statut
        .split(",")
        .filter((statut) =>
          Object.values(DeclarationSejour.statuts).includes(statut),
        )
    : null,
  departementSuivi: route.query.departementSuivi
    ? route.query.departementSuivi.split(",")
    : null,
  periode: route.query.periode
    ? route.query.periode
        .split(",")
        .filter((periode) => saisons.includes(periode))
    : null,
});

const demandeSejourStore = useDemandeSejourStore();

const idOptions = computed(() => {
  return demandeSejourStore.demandes
    .map((d) => d.declarationId)
    .filter((v, i, a) => a.indexOf(v) === i);
});

const siretOptions = computed(() => {
  return demandeSejourStore.demandes
    .map((d) => d.siret)
    .filter((v, i, a) => v !== null && a.indexOf(v) === i);
});

const idFonctionnellesOptions = computed(() => {
  return demandeSejourStore.demandes
    .filter((v) => v.idFonctionnelle)
    .map((d) => d.idFonctionnelle)
    .filter((v, i, a) => a.indexOf(v) === i);
});
const departementOptions = computed(() => {
  return departementStore.departements.map((d) => {
    return { label: d.text, value: d.value };
  });
});

const statutOptions = [
  { label: "BROUILLON", value: "BROUILLON" },
  { label: "TRANSMISE", value: "TRANSMISE" },
  { label: "TRANSMISE 8 JOURS", value: "TRANSMISE 8J" },
  { label: "EN COURS", value: "EN COURS" },
  { label: "EN COURS 8 JOURS", value: "EN COURS 8J" },
  { label: "A MODIFIER", value: "A MODIFIER" },
  { label: "A MODIFIER 8 JOURS", value: "A MODIFIER 8J" },
  {
    label: "EN ATTENTE DECLARATION 8 JOURS",
    value: "EN ATTENTE DECLARATION 8 JOURS",
  },
  { label: "VALIDEE 8 JOURS", value: "VALIDEE 8J" },
  { label: "REFUSEE", value: "REFUSEE" },
  { label: "REFUSEE 8 JOURS", value: "REFUSEE 8J" },
  { label: "ANNULEE", value: "ANNULEE" },
  { label: "ABANDONNEE", value: "ABANDONNEE" },
  { label: "SEJOUR EN COURS", value: "SEJOUR EN COURS" },
  { label: "TERMINEE", value: "TERMINEE" },
];

const removeAttribute = (object, key) =>
  (({ [key]: rest, ...query }) => ({ [key]: rest, query }))(object);

const onUpdateId = (id) => {
  if (id.length) {
    navigateTo({
      replace: true,
      query: { ...route.query, declarationId: id.join(",") },
    });
  } else {
    const { query } = removeAttribute(route.query, "declarationId");
    navigateTo({ replace: true, query });
  }
  search.declarationId = id;
};

const onUpdateSiret = (siret) => {
  if (siret.length) {
    navigateTo({
      replace: true,
      query: { ...route.query, siret: siret.join(",") },
    });
  } else {
    const { query } = removeAttribute(route.query, "siret");
    navigateTo({ replace: true, query });
  }
  search.siret = siret;
};
const onUpdateIdFonctionnelle = (idFonctionnelle) => {
  if (idFonctionnelle.length) {
    navigateTo({
      replace: true,
      query: { ...route.query, idFonctionnelle: idFonctionnelle.join(",") },
    });
  } else {
    const { query } = removeAttribute(route.query, "idFonctionnelle");
    navigateTo({ replace: true, query });
  }
  search.idFonctionnelle = idFonctionnelle;
};

const onUpdateDepartement = (d) => {
  if (d.length) {
    navigateTo({
      replace: true,
      query: { ...route.query, departementSuivi: d.join(",") },
    });
  } else {
    const { query } = removeAttribute(route.query, "departementSuivi");
    navigateTo({ replace: true, query });
  }
  search.departementSuivi = d;
};

const onUpdateStatut = (s) => {
  if (s.length) {
    navigateTo({
      replace: true,
      query: { ...route.query, statut: s.join(",") },
    });
  } else {
    const { query } = removeAttribute(route.query, "statut");
    navigateTo({ replace: true, query });
  }
  search.statut = s;
};

const onUpdateSaison = (periode) => {
  if (periode.length) {
    navigateTo({
      replace: true,
      query: { ...route.query, periode: periode.join(",") },
    });
  } else {
    const { query } = removeAttribute(route.query, "periode");
    navigateTo({ replace: true, query });
  }
  search.periode = periode;
};

const listeStatutAutoriseBoutonDeleteCancel = [
  DeclarationSejour.statuts.BROUILLON,
  DeclarationSejour.statuts.TRANSMISE,
  DeclarationSejour.statuts.EN_COURS,
  DeclarationSejour.statuts.A_MODIFIER,
  DeclarationSejour.statuts.ATTENTE_8_JOUR,
  DeclarationSejour.statuts.TRANSMISE_8J,
  DeclarationSejour.statuts.EN_COURS_8J,
  DeclarationSejour.statuts.A_MODIFIER_8J,
];

const headers = [
  {
    column: "idFonctionnelle",
    sorter: "idFonctionnelle",
    text: "N° enregistrement",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "departementSuivi",
    sorter: "departementSuivi",
    text: "Département instructeur",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "siret",
    text: "SIRET déclarant",
    sorter: "siret",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "libelle",
    text: "Titre",
    sorter: "libelle",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "periode",
    text: "Saison",
    sorter: "periode",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "dateDebut",
    text: "Date de début",
    sorter: "dateDebut",
    format: (value) => dayjs(value.dateDebut).format("DD/MM/YYYY"),
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "dateFin",
    text: "Date de fin",
    sorter: "dateFin",
    format: (value) => dayjs(value.dateFin).format("DD/MM/YYYY"),
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "statut",
    sorter: "statut",
    text: "Statut",
    format: (value) => ({
      component: DsfrBadge,
      label: value.statut,
      noIcon: true,
      type: [
        DeclarationSejour.statuts.TRANSMISE,
        DeclarationSejour.statuts.TRANSMISE_8J,
        DeclarationSejour.statuts.EN_COURS,
        DeclarationSejour.statuts.EN_COURS_8J,
        DeclarationSejour.statuts.VALIDEE_8J,
        DeclarationSejour.statuts.SEJOUR_EN_COURS,
      ].includes(value.statut)
        ? "success"
        : [DeclarationSejour.statuts.BROUILLON].includes(value.statut)
          ? "info"
          : [
                DeclarationSejour.statuts.A_MODIFIER,
                DeclarationSejour.statuts.A_MODIFIER_8J,
                DeclarationSejour.statuts.ATTENTE_8_JOUR,
              ].includes(value.statut)
            ? "warning"
            : "union",
    }),
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "editedAt",
    sorter: "editedAt",
    format: (value) => dayjs(value.editedAt).format("DD/MM/YYYY HH:mm"),
    text: "Date de modification",

    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "actions",
    component: (row) => {
      return {
        component: DsfrButtonGroup,
        align: "center",
        size: "md",
        inline: true,
        buttons: [
          {
            label: "Dupliquer",
            iconOnly: true,
            icon: "ri-file-copy-2-fill",
            disabled: ![
              DeclarationSejour.statuts.BROUILLON,
              DeclarationSejour.statuts.TRANSMISE,
              DeclarationSejour.statuts.EN_COURS,
              DeclarationSejour.statuts.ANNULEE,
              DeclarationSejour.statuts.ABANDONNEE,
            ].includes(row.statut),
            onClick: (event) => {
              event.stopPropagation();
              copyDS(row.declarationId);
            },
          },
          {
            label:
              row.statut === DeclarationSejour.statuts.BROUILLON
                ? "Supprimer"
                : "Annuler",
            iconOnly: true,
            icon:
              row.statut === DeclarationSejour.statuts.BROUILLON
                ? "ri-delete-bin-2-line"
                : "ri-close-line",
            onClick: (event) => {
              event.stopPropagation();
              row.statut === DeclarationSejour.statuts.BROUILLON
                ? deleteDS(row.declarationId)
                : cancelDS(row.declarationId);
            },
            disabled: !listeStatutAutoriseBoutonDeleteCancel.includes(
              row.statut,
            ),
          },
        ],
      };
    },
    text: "Actions",
    headerAttrs: {
      class: "suivi",
    },
  },
];
async function copyDS(dsId) {
  log.i("copyDS -IN");
  try {
    const url = `/sejour/${dsId}/copy`;
    const response = await $fetchBackend(url, {
      method: "POST",
      credentials: "include",
    });
    if (response.declarationId) {
      toaster.success(`Déclaration dupliquée`);
      demandeSejourStore.fetchDemandes();
    }
    log.d(`demande de séjour ${response.declarationId} dupliquée`);
  } catch (error) {
    log.w("Copie de la declaration de sejour : ", { error });
    return toaster.error(
      `Une erreur est survenue lors de la copie de la déclaration de séjour`,
    );
  }
}
async function deleteDS(dsId) {
  log.i("deleteDS -IN");
  try {
    const url = `/sejour/${dsId}`;
    const response = await $fetchBackend(url, {
      method: "DELETE",
      credentials: "include",
    });
    if (response.deletedRows === 1) {
      toaster.success(`Déclaration supprimée`);
      demandeSejourStore.fetchDemandes();
    } else {
      log.w("Erreur durant la suppression de la declaration de sejour");
      return toaster.error(
        `Une erreur est survenue lors de la suppression de la déclaration de séjour`,
      );
    }
  } catch (error) {
    log.w("Erreur durant la suppression de la declaration de sejour : ");
    return toaster.error(
      `Une erreur est survenue lors de la suppression de la déclaration de séjour`,
    );
  }
}
async function cancelDS(dsId) {
  log.i("cancelDS -IN");
  try {
    const url = `/sejour/cancel/${dsId}`;
    const response = await $fetchBackend(url, {
      method: "POST",
      credentials: "include",
    });
    if (response.canceletedRows === 1) {
      toaster.success(`Déclaration annulée`);
      demandeSejourStore.fetchDemandes();
    } else {
      log.w("Erreur durant l'annulation de la declaration de sejour");
      return toaster.error(
        `Une erreur est survenue lors de l'annulation' de la déclaration de séjour`,
      );
    }
  } catch (error) {
    log.w("Erreur durant l'annulation de la declaration de sejour : ");
    return toaster.error(
      `Une erreur est survenue lors de l'annulation de la déclaration de séjour`,
    );
  }
}

departementStore.fetch();
demandeSejourStore.fetchDemandes();
</script>

<style>
th.suivi {
  cursor: pointer;
}
</style>
