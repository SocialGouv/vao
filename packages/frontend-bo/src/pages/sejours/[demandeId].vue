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
                  :comment="comments?.organisateurs?.[i]?.[entry] ?? ''"
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
                :comment="comments?.vacanciers?.[entry] ?? ''"
                @emit-comment="addComment('vacanciers', entry, $event)"
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
                :comment="comments?.personnel?.[entry] ?? ''"
                @emit-comment="addComment('personnel', entry, $event)"
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
                :comment="comments?.projet_sejour?.[entry] ?? ''"
                @emit-comment="addComment('projet_sejour', entry, $event)"
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
                :comment="comments?.transport?.[entry] ?? ''"
                @emit-comment="addComment('transport', entry, $event)"
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
} from "@gouvminint/vue-dsfr";
import DisplayInput from "~/components/demandes-sejour/DisplayInput.vue";
import Details from "~/components/demandes-sejour/Details.vue";
import displayInput from "~/utils/display-input";

const route = useRoute();
const demandeStore = useDemandeSejourStore();

const expandedId = ref("");
const comments = ref({});

const demande = demandeStore.getById(route.params.idDemande);
if (!demande) {
  navigateTo("/sejours");
}

onMounted(() => {
  comments.value =
    JSON.parse(localStorage.getItem("comments") ?? "{}")[
      route.params.idDemande
    ] ?? {};
});

useInterval(() => {
  const currentStorage = JSON.parse(localStorage.getItem("comments") ?? "{}");
  localStorage.setItem(
    "comments",
    JSON.stringify({
      ...currentStorage,
      [route.params.idDemande]: comments.value,
    }),
  );
}, 2000);

const tabTitles = [
  { title: " Formulaire" },
  { title: "Documents joints" },
  { title: "historique" },
];

const getCommentValue = (value) => (value != "" ? value : null);

const addCommentOrganisateurs = (index, attribute, value) => {
  if (!comments.value?.organisateurs) {
    comments.value.organisateurs = new Array(
      demande?.organisateurs?.organisateurs.length,
    ).fill(null);
  }

  comments.value.organisateurs[index] = {
    ...comments.value.organisateurs[index],
    [attribute]: getCommentValue(value),
  };
};
const addComment = (category, attribute, value) => {
  if (!comments.value[category]) {
    comments.value[category] = { [attribute]: getCommentValue(value) };
  } else {
    comments.value[category][attribute] = getCommentValue(value);
  }
};

const commentsInHtml = computed(() => {
  let resOrganisateur = "";

  //  Organisateurs
  for (const [
    index,
    organisateurComment,
  ] of comments.value.organisateurs?.entries() ?? []) {
    const commentsByQuestion = Object.entries(displayInput.IOrganisateur)
      .map(([entry, value]) => {
        if (organisateurComment?.[entry] != null) {
          return `
                  <div>
                  <span style="color: gray">${value.label}</span> :
                  <pre style="background-color:#e5e5e5;padding: 1em; margin: 0; font-family: inherit; white-space: pre-wrap">${organisateurComment[entry].replaceAll("<", "&#60;")}</pre>
                  </div>
              `;
        } else {
          return null;
        }
      })
      .filter((c) => c != null);
    if (commentsByQuestion.length > 0) {
      resOrganisateur +=
        `<h6 style="margin: 0">Organisateur ${index + 1} : </h6>` +
        commentsByQuestion.join("\n");
    }
  }

  //  Vacancier
  const resVacanciers = displayInput.displayCommentForOneCategory(
    displayInput.IVacancier,
    comments.value.vacanciers,
    "Vacancier",
  );

  //  Personnel
  const resPersonnel = displayInput.displayCommentForOneCategory(
    displayInput.Ipersonnel,
    comments.value.personnel,
    "Personnel",
  );

  //  ProjetSejour
  const resProjetSejour = displayInput.displayCommentForOneCategory(
    displayInput.IProjetSejour,
    comments.value.projet_sejour,
    "Projet de séjour",
  );

  //  Transport
  const resTransport = displayInput.displayCommentForOneCategory(
    displayInput.ITransport,
    comments.value.transport,
    "Informations sur le transport",
  );

  //  Sanitaire
  const resSanitaire = displayInput.displayCommentForOneCategory(
    displayInput.ISanitaire,
    comments.value.sanitaires,
    "Informations sanitaires",
  );

  return (
    resOrganisateur +
    resVacanciers +
    resPersonnel +
    resProjetSejour +
    resTransport +
    resSanitaire
  );
});
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

.comment {
  max-height: 30vh;
  overflow: hidden;
}

.comment:hover {
  max-height: 30vh;
  overflow: auto;
}
</style>
