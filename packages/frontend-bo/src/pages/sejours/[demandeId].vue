<!--  Doc utilisée pour construire le dsfr tab : https://docs.vue-ds.fr/composants/DsfrTabs-->

<template>
  <div v-if="!!demandeStore.currentDemande" class="fr-container header">
    <Details />
    <DsfrTabs
      tab-list-name="display-formulaire"
      :tab-titles="tabTitles"
      :initial-selected-index="initialSelectedIndex"
      @select-tab="selectTab"
    >
      <DsfrTabContent
        panel-id="tab-content-0"
        tab-id="tab-0"
        :selected="selectedTabIndex === 0"
        :asc="asc"
      >
        <DsfrAccordionsGroup>
          <li v-if="demandeStore.currentDemande?.organismes">
            <DsfrAccordion
              :title="`Organismes`"
              :expanded-id="expandedId"
              @expand="expandedId = $event"
            >
              <div
                v-if="
                  demandeStore.currentDemande?.organismes?.typeOrganisme ===
                  'personne_morale'
                "
              >
                <h4>Organisme</h4>
                <DisplayInput
                  v-for="entry in Object.keys(displayInput.IOrganisme)"
                  :key="`organismes-${entry}`"
                  :value="
                    demandeStore.currentDemande.organismes.personneMorale[entry]
                  "
                  :input="displayInput.IOrganisme[entry]"
                />
                <h4>Responsable du séjour</h4>
                <DisplayInput
                  v-for="entry in Object.keys(displayInput.IResponsableSejour)"
                  :key="`organismes-responsableSejour-${entry}`"
                  :value="
                    demandeStore.currentDemande.organismes.personneMorale
                      .responsableSejour[entry]
                  "
                  :input="displayInput.IResponsableSejour[entry]"
                />
              </div>
            </DsfrAccordion>
          </li>
          <li v-if="demandeStore.currentDemande?.vacanciers">
            <DsfrAccordion
              :title="`Vacanciers`"
              :expanded-id="expandedId"
              @expand="expandedId = $event"
            >
              <DisplayInput
                v-for="entry in Object.keys(displayInput.IVacancier)"
                :key="`personnel-${entry}`"
                :value="demandeStore.currentDemande.vacanciers[entry]"
                :input="displayInput.IVacancier[entry]"
              />
            </DsfrAccordion>
          </li>
          <li v-if="demandeStore.currentDemande?.personnel">
            <DsfrAccordion
              :title="`Personnel`"
              :expanded-id="expandedId"
              @expand="expandedId = $event"
            >
              <DisplayInput
                v-for="entry in Object.keys(displayInput.Ipersonnel)"
                :key="`personnel-${entry}`"
                :value="demandeStore.currentDemande.personnel[entry]"
                :input="displayInput.Ipersonnel[entry]"
              />
            </DsfrAccordion>
          </li>
          <li v-if="demandeStore.currentDemande?.projet_sejour">
            <DsfrAccordion
              :title="`Projet de séjour`"
              :expanded-id="expandedId"
              @expand="expandedId = $event"
            >
              <DisplayInput
                v-for="entry in Object.keys(displayInput.IProjetSejour)"
                :key="`projet-sejour-${entry}`"
                :value="demandeStore.currentDemande.projet_sejour[entry]"
                :input="displayInput.IProjetSejour[entry]"
              />
            </DsfrAccordion>
          </li>
          <li v-if="demandeStore.currentDemande?.transport">
            <DsfrAccordion
              :title="`Information sur le transport`"
              :expanded-id="expandedId"
              @expand="expandedId = $event"
            >
              <DisplayInput
                v-for="entry in Object.keys(displayInput.ITransport)"
                :key="`transport-${entry}`"
                :value="demandeStore.currentDemande.transport[entry]"
                :input="displayInput.ITransport[entry]"
              />
            </DsfrAccordion>
          </li>
          <li v-if="demandeStore.currentDemande?.sanitaires">
            <DsfrAccordion
              :title="`Information sanitaires`"
              :expanded-id="expandedId"
              @expand="expandedId = $event"
            >
              <DisplayInput
                v-for="entry in Object.keys(displayInput.ISanitaire)"
                :key="`transport-${entry}`"
                :value="demandeStore.currentDemande.sanitaires[entry]"
                :input="displayInput.ISanitaire[entry]"
              />
            </DsfrAccordion>
          </li>
        </DsfrAccordionsGroup>
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
    <div class="fr-grid-row">
      <div class="fr-col-12 fr-p-4v">
        <h4>Commentaires généraux</h4>
        <DsfrInput
          ref="textarea"
          v-model="comments.generalComment"
          :is-textarea="true"
          label="Commentaires"
          placeholder="Ajouter un commentaire"
          rows="10"
        />
      </div>
    </div>
    <div class="fr-grid-row">
      <div class="fr-col-8 fr-p-4v">
        <DsfrNotice title="Commentaires sur la demande" />
        <div class="comment fr-my-4v" v-html="commentsInHtml"></div>
      </div>
      <div class="fr-col-4 fr-p-4v">
        <DsfrButtonGroup>
          <DsfrButton @click="console.log('je valide')">Valider</DsfrButton>
        </DsfrButtonGroup>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  DsfrAccordion,
  DsfrAccordionsGroup,
  DsfrButton,
  DsfrButtonGroup,
  DsfrTabContent,
  DsfrTabs,
  DsfrNotice,
  DsfrInput,
} from "@gouvminint/vue-dsfr";
import DisplayInput from "~/components/demandes-sejour/DisplayInput.vue";
import Details from "~/components/demandes-sejour/Details.vue";
import displayInput from "~/utils/display-input";

const route = useRoute();

const initialSelectedIndex = 0;

const asc = ref(true);
const selectedTabIndex = ref(initialSelectedIndex);

const selectTab = (idx) => {
  asc.value = selectedTabIndex.value < idx;
  selectedTabIndex.value = idx;
};

const demandeStore = useDemandeSejourStore();

const expandedId = ref("");
const comments = ref({});

onMounted(async () => {
  try {
    await demandeStore.setCurrentDemande(route.params.idDemande);
  } catch (e) {
    console.log("je catch");
    navigateTo("/sejours");
  }
  comments.value =
    JSON.parse(localStorage.getItem("comments") ?? "{}")[
      route.params.idDemande
    ] ?? {};
});

watch(comments, (c) => saveComment(c), { deep: true });

// const getCommentsNumber = (category) => {
//   return comments.value[category]
//     ? Object.values(comments.value[category]).filter((o) => !!o).length
//     : 0;
// };

const saveComment = debounce((comments) => {
  const currentStorage = JSON.parse(localStorage.getItem("comments") ?? "{}");
  localStorage.setItem(
    "comments",
    JSON.stringify({
      ...currentStorage,
      [route.params.idDemande]: comments,
    }),
  );
});

const tabTitles = [
  { title: " Formulaire" },
  { title: "Documents joints" },
  { title: "historique" },
];

/*const getCommentValue = (value) => (value != "" ? value : null);

const addComment = (category, attribute, value) => {
  if (!comments.value[category]) {
    comments.value[category] = { [attribute]: getCommentValue(value) };
  } else {
    comments.value[category][attribute] = getCommentValue(value);
  }
};*/

const commentsInHtml = computed(() =>
  displayInput.getHtmlComments(comments.value),
);
</script>

<style scoped>
.header {
  padding: 1em 0em;
}

.comment {
  max-height: 30vh;
  overflow: hidden;
}

.comment:hover {
  max-height: 30vh;
  overflow: auto;
}
</style>
