<!--  Doc utilisée pour construire le dsfr tab : https://docs.vue-ds.fr/composants/DsfrTabs-->

<template>
  <div v-if="!!demande" class="fr-container header">
    <Details></Details>
    <DsfrTabs
      tab-list-name="display-formulaire"
      :tab-titles="tabTitles"
      initial-selected-index="initialSelectedIndex"
      @select-tab="selectTab"
    >
      <DsfrTabContent
        panel-id="tab-content-0"
        tab-id="tab-0"
        :selected="selectedTabIndex === 0"
        :asc="asc"
      >
        <DsfrAccordionsGroup>
          <li v-if="demande?.organisateurs?.organisateurs">
            <DsfrAccordion
              title="Organisateurs"
              :expanded-id="expandedId"
              @expand="expandedId = $event"
            >
              <div
                v-for="(organisateur, i) in demande?.organisateurs
                  ?.organisateurs ?? {}"
                :key="i"
              >
                <h2>Organisateur {{ i + 1 }}</h2>
                <DisplayInput
                  v-for="entry in Object.keys(displayInput.IOrganisateur)"
                  :key="`organisateur-${i}+${entry}`"
                  :value="organisateur[entry]"
                  :input="displayInput.IOrganisateur[entry]"
                  @emit-comment="
                    (comment) => addCommentOrganisateurs(i, entry, comment)
                  "
                />
              </div>
            </DsfrAccordion>
          </li>
          <li v-if="demande.vacanciers">
            <DsfrAccordion
              title="Vacanciers"
              :expanded-id="expandedId"
              @expand="expandedId = $event"
            >
              <DisplayInput
                v-for="entry in Object.keys(displayInput.IVacancier)"
                :key="`personnel-${entry}`"
                :value="demande.vacanciers[entry]"
                :input="displayInput.IVacancier[entry]"
              />
            </DsfrAccordion>
          </li>
          <li v-if="demande?.personnel">
            <DsfrAccordion
              title="Personnel"
              :expanded-id="expandedId"
              @expand="expandedId = $event"
            >
              <DisplayInput
                v-for="entry in Object.keys(displayInput.Ipersonnel)"
                :key="`personnel-${entry}`"
                :value="demande.personnel[entry]"
                :input="displayInput.Ipersonnel[entry]"
              />
            </DsfrAccordion>
          </li>
          <li v-if="demande?.projet_sejour">
            <DsfrAccordion
              title="Projet de séjour"
              :expanded-id="expandedId"
              @expand="expandedId = $event"
            >
              <DisplayInput
                v-for="entry in Object.keys(displayInput.IProjetSejour)"
                :key="`projet-sejour-${entry}`"
                :value="demande.projet_sejour[entry]"
                :input="displayInput.IProjetSejour[entry]"
              />
            </DsfrAccordion>
          </li>
          <li v-if="demande?.transport">
            <DsfrAccordion
              title="Informations sur le transport"
              :expanded-id="expandedId"
              @expand="expandedId = $event"
            >
              <DisplayInput
                v-for="entry in Object.keys(displayInput.ITransport)"
                :key="`transport-${entry}`"
                :value="demande.transport[entry]"
                :input="displayInput.ITransport[entry]"
              />
            </DsfrAccordion>
          </li>
          <li v-if="demande?.sanitaires">
            <DsfrAccordion
              title="Informations sanitaires"
              :expanded-id="expandedId"
              @expand="expandedId = $event"
            >
              <DisplayInput
                v-for="entry in Object.keys(displayInput.ISanitaire)"
                :key="`transport-${entry}`"
                :value="demande.sanitaires[entry]"
                :input="displayInput.ISanitaire[entry]"
              />
            </DsfrAccordion>
          </li>
        </DsfrAccordionsGroup>

        <pre>{{ comments }}</pre>
        <pre>{{ demande }}</pre>
      </DsfrTabContent>

      <DsfrTabContent
        panel-id="tab-content-1"
        tab-id="tab-1"
        :selected="selectedTabIndex === 1"
        :asc="asc"
      >
        <div>EN CONSTRUCTION : Documents joints</div>
      </DsfrTabContent>
      <DsfrTabContent
        panel-id="tab-content-2"
        tab-id="tab-2"
        :selected="selectedTabIndex === 2"
        :asc="asc"
      >
        <div>EN CONSTRUCTION : historique</div>
      </DsfrTabContent>
    </DsfrTabs>
  </div>
</template>

<script setup>
import {
  DsfrAccordion,
  DsfrAccordionsGroup,
  DsfrTabContent,
  DsfrTabs,
} from "@gouvminint/vue-dsfr";
import DisplayInput from "~/components/demandes-sejour/DisplayInput.vue";
import Details from "~/components/demandes-sejour/Details.vue";
import displayInput from "~/utils/display-input";

const expandedId = ref("");

const route = useRoute();
const demandeStore = useDemandeSejourStore();

const demande = demandeStore.getById(route.params.idDemande);

if (!demande) {
  navigateTo("/sejours");
}

const tabTitles = [
  { title: " Formulaire" },
  { title: "Documents joints" },
  { title: "historique" },
];

const comments = reactive({});

const addCommentOrganisateurs = (index, attribute, value) => {
  if (!comments?.organisateurs?.organisateurs) {
    comments.organisateurs = {
      organisateurs: new Array(
        demande?.organisateurs?.organisateurs.length,
      ).fill(null),
    };
  }

  comments.organisateurs.organisateurs[index] = {
    ...comments.organisateurs.organisateurs[index],
    [attribute]: value,
  };
};

const initialSelectedIndex = 0;

const asc = ref(true);
const selectedTabIndex = ref(initialSelectedIndex);

const selectTab = (idx) => {
  asc.value = selectedTabIndex.value < idx;
  selectedTabIndex.value = idx;
};
</script>

<style scoped>
.header {
  padding: 1em 0em;
}
</style>
