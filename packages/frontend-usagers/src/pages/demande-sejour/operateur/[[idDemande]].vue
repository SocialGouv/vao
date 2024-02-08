<template>
  <div>
    <DsfrBreadcrumb :links="links" />
    <DSStepper :step="1"></DSStepper>
    <div class="fr-container">
      <div class="fr-grid-row">
        <div v-show="display === 'selection'">
          <fieldset class="fr-fieldset">
            <div class="fr-col-12">
              <span>Veuillez sélectionner une ligne en cliquant dessus :</span>
            </div>
            <div class="fr-col-4">
              <div class="fr-input-group">
                <DsfrInputGroup
                  :model-value="selectedOperateur?.personneMorale?.siret"
                  :disabled="true"
                  label="Numéro SIRET"
                  name="siretSelected"
                  :label-visible="true"
                  placeholder=""
                />
              </div>
            </div>
            <div class="fr-col-4">
              <div class="fr-input-group">
                <DsfrInputGroup
                  :model-value="selectedOperateur?.personneMorale?.nom"
                  :disabled="true"
                  label="Dénomination"
                  placeholder=""
                  name="nomSelected"
                  :label-visible="true"
                />
              </div>
            </div>
            <div class="fr-col-4">
              <div class="fr-input-group">
                <DsfrInputGroup
                  :model-value="selectedOperateur?.personneMorale?.commune"
                  :disabled="true"
                  label="Commune"
                  placeholder=""
                  name="communeSelected"
                  :label-visible="true"
                />
              </div>
            </div>
          </fieldset>
          <fieldset class="fr-fieldset">
            <UtilsTableFullWithoutPagination
              :headers="headers"
              :data="operateurs"
              :selected="selectedOperateur?.personneMorale?.siren ?? ''"
              index-to-compare="0"
              :row-navigate="navigate"
            ></UtilsTableFullWithoutPagination>
          </fieldset>
          <fieldset class="fr-fieldset">
            <div class="fr-col-4">
              <div class="fr-input-group">
                <DsfrButton id="retour" @click="back">Retour</DsfrButton>
              </div>
            </div>
            <div class="fr-col-4">
              <div class="fr-input-group">
                <DsfrButton
                  id="ajoutOperateur"
                  :secondary="true"
                  @click="display = 'ajoutOperateur'"
                  >Ajouter opérateur</DsfrButton
                >
              </div>
            </div>
            <div class="fr-col-4">
              <div class="fr-input-group">
                <DsfrButton
                  :disabled="!selectedOperateur"
                  @click="validateOperateur()"
                  >Suivant</DsfrButton
                >
              </div>
            </div>
          </fieldset>
        </div>
        <div v-show="display === 'ajoutOperateur'">
          <AjoutOperateur
            @back="backFromComponent"
            @add="AddOperateur"
          ></AjoutOperateur>
        </div>
        <div v-show="display === 'ajoutAgrement'">
          <AddAgrementDocToOperateur
            file-type="agrement"
            :agrement="{}"
            text-to-display="Veuillez télécharger votre agrément"
            :operateur-id="operateurStore?.operateurCourant?.operateurId ?? 0"
            @back="backFromComponent"
            @add="AddAgrement"
          ></AddAgrementDocToOperateur>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { useOperateurStore } from "@/stores/operateur";
import { useDemandeSejourStore } from "~/stores/demande-sejour";
import "@vueform/multiselect/themes/default.css";
const route = useRoute();
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;
const log = logger("pages/demande-sejour/operateur");

const config = useRuntimeConfig()

definePageMeta({
  middleware: ["is-connected"],
});

const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    to: "/demande-sejour/liste",
    text: "Demande de séjour",
  },
  {
    text: "sélection de l'opérateur",
  },
];
const operateurStore = useOperateurStore();
const demandeSejourStore = useDemandeSejourStore();

const isUpdate = computed(() => {
  return !!route.params.idDemande;
});

const display = ref("selection");
const headers = [
  {
    column: "personneMorale",
    format: (row) => row.personneMorale.siren,
    text: "N° SIREN",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "nic",
    format: (row) => row.personneMorale.siret.substring(9, 14),
    text: "Code Etab.",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "nom",
    format: (row) => row.personneMorale.nom,
    text: "Nom",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "adresse",
    format: (row) => row.personneMorale.adresse,
    text: "Adresse",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "codePostal",
    format: (row) => row.personneMorale.codePostal,
    text: "Code Postal",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "commune",
    format: (row) => row.personneMorale.commune,
    text: "Commune",
    headerAttrs: {
      class: "suivi",
    },
  },
];

const demandeCourante = computed(
  () => demandeSejourStore.demandeCourante ?? {}
);

const operateurs = computed(() => operateurStore.operateurs ?? []);

const lineSelected = ref({});

const selectedOperateur = computed(() => {
  if (!lineSelected.value.operateurId) {
    return (
      operateurs.value.find(
        (o) => o.operateurId === demandeCourante.value.operateurId
      ) ?? {}
    );
  } else return lineSelected.value;
});

function navigate(item) {
  lineSelected.value = operateurs.value.find(
    (o) => o.operateurId === item.operateurId
  );
}

async function validateOperateur() {
  await operateurStore.setOperateurCourant(selectedOperateur.value.operateurId);
  if (
    !selectedOperateur.value.agrement ||
    selectedOperateur.value.agrement.length === 0
  ) {
    display.value = "ajoutAgrement";
  } else if (isUpdate.value) {
    if (
      selectedOperateur.value.operateurId !==
      demandeSejourStore.demandeCourante.operateurId
    ) {
      log.d("update");
      try {
        const url = `${config.public.backendUrl}/sejour/${route.params.idDemande}`;
        await useFetch(url, {
          method: "POST",
          body: {
            parametre: { operateurId: selectedOperateur.value.operateurId },
            type: "operateur",
          },
          onResponse({ response }) {
            if (!response.ok) {
              toaster.error(
                response._data.message ?? "Erreur lors de la sauvegarde"
              );
            } else {
              log.d("demande de sejour mise à jour");
              toaster.success("modification d'opérateur sauvegardée");
            }
          },
        });
      } catch (error) {
        log.w("update demande sejour - erreur", { error });
      }
    }
    log.d("redirection vers page id");
    await navigateTo(
      `/demande-sejour/informations-generales/${route.params.idDemande}`
    );
  } else {
    log.d("redirection vers page sans id");
    await navigateTo("/demande-sejour/informations-generales");
  }
}

async function AddOperateur(newOperateurId) {
  await operateurStore.fetchOperateurs();
  lineSelected.value = operateurs.value.find((o) => {
    return o.operateurId === newOperateurId;
  });
  display.value = "selection";
}

async function AddAgrement() {
  await navigateTo("/demande-sejour/informations-generales");
}

async function back() {
  await navigateTo("/");
}

function backFromComponent() {
  display.value = "selection";
}

onMounted(async () => {
  await operateurStore.fetchOperateurs();
  if (isUpdate.value) {
    await demandeSejourStore.setDemandeCourante(route.params.idDemande);
  }
});
</script>

<style lang="scss" scoped>
#bloc-connexion {
  color: #000091;
  border-radius: 10px;
  border: solid;
}
</style>
