<!--  Doc utilisée pour construire le dsfr tab : https://docs.vue-ds.fr/composants/DsfrTabs-->

<template>
  <div v-if="!!demande" class="fr-container header">
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
          <li v-if="demande?.organismes">
            <DsfrAccordion
              :title="`organismes (${getCommentsNumber('organismes')})`"
              :expanded-id="expandedId"
              @expand="expandedId = $event"
            >
              <h4 v-if="demande?.organismes?.siret">Organisme</h4>
              <DisplayInput
                v-for="entry in Object.keys(displayInput.IOrganisme)"
                :key="`organismes-${entry}`"
                :value="demande.organismes[entry]"
                :input="displayInput.IOrganisme[entry]"
                :comment="comments?.organismes?.[entry] ?? ''"
                @emit-comment="
                  (comment) => addComment('organismes', entry, comment)
                "
              />
              <h4>Responsable du séjour</h4>
              <DisplayInput
                v-for="entry in Object.keys(displayInput.IResponsableSejour)"
                :key="`organismes-responsableSejour-${entry}`"
                :value="demande.organismes.responsableSejour[entry]"
                :input="displayInput.IResponsableSejour[entry]"
              />
            </DsfrAccordion>
          </li>
          <li v-if="demande.vacanciers">
            <DsfrAccordion
              :title="`Vacanciers (${getCommentsNumber('vacanciers')})`"
              :expanded-id="expandedId"
              @expand="expandedId = $event"
            >
              <DisplayInput
                v-for="entry in Object.keys(displayInput.IVacancier)"
                :key="`personnel-${entry}`"
                :value="demande.vacanciers[entry]"
                :input="displayInput.IVacancier[entry]"
                :comment="comments?.vacanciers?.[entry] ?? ''"
                @emit-comment="addComment('vacanciers', entry, $event)"
              />
            </DsfrAccordion>
          </li>
          <li v-if="demande?.personnel">
            <DsfrAccordion
              :title="`Personnel (${getCommentsNumber('personnel')})`"
              :expanded-id="expandedId"
              @expand="expandedId = $event"
            >
              <DisplayInput
                v-for="entry in Object.keys(displayInput.Ipersonnel)"
                :key="`personnel-${entry}`"
                :value="demande.personnel[entry]"
                :input="displayInput.Ipersonnel[entry]"
                :comment="comments?.personnel?.[entry] ?? ''"
                @emit-comment="addComment('personnel', entry, $event)"
              />
            </DsfrAccordion>
          </li>
          <li v-if="demande?.projet_sejour">
            <DsfrAccordion
              :title="`Projet de séjour (${getCommentsNumber('projet_sejour')})`"
              :expanded-id="expandedId"
              @expand="expandedId = $event"
            >
              <DisplayInput
                v-for="entry in Object.keys(displayInput.IProjetSejour)"
                :key="`projet-sejour-${entry}`"
                :value="demande.projet_sejour[entry]"
                :input="displayInput.IProjetSejour[entry]"
                :comment="comments?.projet_sejour?.[entry] ?? ''"
                @emit-comment="addComment('projet_sejour', entry, $event)"
              />
            </DsfrAccordion>
          </li>
          <li v-if="demande?.transport">
            <DsfrAccordion
              :title="`Information sur le transport (${getCommentsNumber('transport')})`"
              :expanded-id="expandedId"
              @expand="expandedId = $event"
            >
              <DisplayInput
                v-for="entry in Object.keys(displayInput.ITransport)"
                :key="`transport-${entry}`"
                :value="demande.transport[entry]"
                :input="displayInput.ITransport[entry]"
                :comment="comments?.transport?.[entry] ?? ''"
                @emit-comment="addComment('transport', entry, $event)"
              />
            </DsfrAccordion>
          </li>
          <li v-if="demande?.sanitaires">
            <DsfrAccordion
              :title="`Information sanitaires (${getCommentsNumber('sanitaires')})`"
              :expanded-id="expandedId"
              @expand="expandedId = $event"
            >
              <DisplayInput
                v-for="entry in Object.keys(displayInput.ISanitaire)"
                :key="`transport-${entry}`"
                :value="demande.sanitaires[entry]"
                :input="displayInput.ISanitaire[entry]"
                :comment="comments?.sanitaires?.[entry] ?? ''"
                @emit-comment="addComment('sanitaires', entry, $event)"
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

onMounted(() => {
  comments.value =
    JSON.parse(localStorage.getItem("comments") ?? "{}")[
      route.params.idDemande
    ] ?? {};
});

watch(comments, (c) => saveComment(c), { deep: true });

const getCommentsNumber = (category) => {
  return comments.value[category]
    ? Object.values(comments.value[category]).filter((o) => !!o).length
    : 0;
};

const demande = demandeStore.getById(route.params.idDemande);
if (!demande) {
  navigateTo("/sejours");
}

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

const getCommentValue = (value) => (value != "" ? value : null);

const addComment = (category, attribute, value) => {
  if (!comments.value[category]) {
    comments.value[category] = { [attribute]: getCommentValue(value) };
  } else {
    comments.value[category][attribute] = getCommentValue(value);
  }
};

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
