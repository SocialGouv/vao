<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <CardsNumber
          v-if="userStore.user.serviceCompetent === 'DEP'"
          :values="[
            {
              title: 'Messages non lus',
              value: sejourStore.stats?.nonlu || 0,
            },
            {
              title: 'Messages lus',
              value: sejourStore.stats?.lu || 0,
            },
            {
              title: 'Messages répondus',
              value: sejourStore.stats?.repondu || 0,
            },
          ]"
        />
      </div>
      <div class="fr-col-12">
        <form>
          <div class="fr-fieldset">
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-3"
            >
              <div class="fr-input-group">
                <DsfrInputGroup
                  v-model="searchState.idFonctionnelle"
                  type="text"
                  name="libelle"
                  label="Numéro de déclaration"
                  placeholder="Numéro de déclaration"
                  :label-visible="true"
                />
              </div>
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-3"
            >
              <div class="fr-input-group">
                <DsfrInputGroup
                  v-model="searchState.libelle"
                  type="text"
                  name="libelle"
                  label="Nom du séjour"
                  placeholder="Nom du séjour"
                  :label-visible="true"
                />
              </div>
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <div class="fr-input-group">
                <DsfrInputGroup
                  v-model="searchState.organisme"
                  type="text"
                  name="organisme"
                  label="Organisme"
                  placeholder="Organisme"
                  :label-visible="true"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
    <span class="number-of-ds"
      >{{ sejourStore.total }} déclarations affichées
    </span>
    <DemandesSejourArray
      :headers="headers"
      :ds="sejourStore.demandes"
      :total="sejourStore.total"
      :tab-index-navigation="3"
      :item-per-page="defaultLimit"
      :fetch-demandes="fetchDemande"
      :search-params="searchParams"
    />
  </div>
</template>

<script setup>
import { CardsNumber, MessageEtat, MessageHover } from "@vao/shared";
import dayjs from "dayjs";
import DemandeStatusBadge from "~/components/demandes-sejour/DemandeStatusBadge.vue";
import "@vueform/multiselect/themes/default.css";

definePageMeta({
  middleware: ["is-connected", "check-role"],
  roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
});

const toaster = useToaster();

const sejourStore = useDemandeSejourStore();
const userStore = useUserStore();

const route = useRoute();

const searchState = reactive({
  libelle: route.query.libelle,
  idFonctionnelle: route.query.idFonctionnelle,
  organisme: route.query.organisme,
});

const searchParams = computed(() =>
  Object.entries(searchState).reduce((acc, [key, value]) => {
    if (
      value !== null &&
      value !== "" &&
      (!Array.isArray(value) || value.length > 0)
    ) {
      acc[key] = Array.isArray(value) ? value.join(",") : value;
    }
    return acc;
  }, {}),
);

const fetchDemande = async (params) => {
  try {
    await sejourStore.fetchDemandesMessagerie(params);
  } catch (error) {
    toaster.error({
      titleTag: "h2",
      description:
        "Une erreur est survenue lors de la récupération de la demande",
    });
    throw error;
  }
};

sejourStore.currentDemande = null;

const headers = [
  {
    column: "idFonctionnelle",
    text: "Numéro de déclaration",
    sort: true,
  },
  {
    column: "libelle",
    text: "Libelle",
    sort: true,
  },
  {
    column: "demandeSejourStatut",
    text: "Statut",
    component: ({ statut }) => ({
      component: DemandeStatusBadge,
      statut: statut,
    }),
  },
  {
    column: "demandeSejourOrganisme",
    text: "Organisme",
    format: (value) => demandesSejours.getOrganismeTitle(value),
  },
  {
    column: "dateDebut",
    text: "Dates (Début-fin)",
    format: (value) => demandesSejours.getDateDebutFin(value),
    sort: true,
  },
  {
    column: "messageCreatedAt",
    sorter: "messageCreatedAt",
    format: (value) =>
      value.messageLastAt
        ? dayjs(value.messageLastAt).format("DD/MM/YYYY HH:mm")
        : "",
    text: "Date dernier message",
  },
  {
    column: "message",
    text: "Dernier message",
    component: ({ message }) => ({
      component: MessageHover,
      content: message,
    }),
  },
  {
    column: "messageEtat",
    text: "Message",
    component: ({ messageEtat }) => ({
      component: MessageEtat,
      etat: messageEtat,
    }),
  },
];
</script>

<style scoped>
.number-of-ds {
  font-weight: bold;
  font-style: italic;
  font-size: 1.25rem;
}
</style>
