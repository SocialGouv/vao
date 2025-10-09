<template>
  <DsfrDataTableV2Wrapper
    v-if="isLoaded && data.length !== 0"
    v-model:limit="limit"
    v-model:offset="offset"
    :columns="columns"
    :table-title="title"
    :data="data"
    :total="total"
    row-id="userId"
    is-sortable
    @update-data="updateData"
  >
    <template #cell-dateCreation="{ cell }">
      {{ getDateCreationLabel(cell) }}
    </template>
    <template #cell-statut="{ cell }">
      <div>
        <UserStatusBadge :statut="cell" />
      </div>
    </template>
    <template #cell-custom:edit="{ row }">
      <div class="buttons-group">
        <DsfrButton
          class="button--success"
          icon="ri:check-line"
          icon-only
          primary
          size="small"
          type="button"
          label="Valider le compte"
          @click="validate(row.userId)"
        />
        <DsfrButton
          class="button--danger"
          :icon="'ri:close-line'"
          icon-only
          secondary
          size="small"
          type="button"
          :label="'Refuser le compte'"
          @click="openRefusedModal(row)"
        />
        <NuxtLink
          :to="linkSiret(row.siret)"
          target="_blank"
          title="Consulter le site annuaire entreprise"
          class="no-background-image"
        >
          <DsfrButton
            icon="ri:external-link-fill"
            icon-only
            primary
            size="small"
            type="button"
          />
        </NuxtLink>
      </div>
    </template>
    <template #cell-custom:open-siret="{ row }">
      <NuxtLink
        :to="linkSiret(row.siret)"
        target="_blank"
        title="Consulter le site annuaire entreprise"
        class="no-background-image"
      >
        <DsfrButton
          icon="fr-icon-external-link-fill"
          icon-only
          primary
          size="small"
          type="button"
        />
      </NuxtLink>
    </template>
  </DsfrDataTableV2Wrapper>
  <RefusCompteModal
    modal-ref="modal"
    name="refus-compte"
    :opened="showRefusModal"
    title="Refus de validation d'un compte utilisateur"
    :on-close="closeRefusModal"
    :on-validate="refused"
    validation-label="Valider la prise en charge"
    >Vous allez refuser la validation de ce compte indiquez le motif : <br />
  </RefusCompteModal>

  <h1 v-if="isLoaded && data.length === 0" style="font-size: 1.5rem">
    Il n’y a aucun compte OVA à valider aujourd’hui. <br />
    Vous serez averti par email en cas de nouvelle demande
  </h1>
</template>

<script setup>
import {
  DsfrDataTableV2Wrapper,
  usePagination,
  isValidParams,
  UserStatusBadge,
  statusUser,
  RefusCompteModal,
  columnsTable,
} from "@vao/shared";
import dayjs from "dayjs";

const userStore = useUserStore();
const route = useRoute();
const toaster = useToaster();

const data = computed(() => userStore.usersFO);
const total = computed(() => userStore.totalUsersFO);
const utilisateurSelectionne = ref(null);
const showRefusModal = ref(false);
const optionType = columnsTable.optionType;

const title = computed(() => `Liste des utilisateurs (${total.value})`);
function linkSiret(siret) {
  return `https://annuaire-entreprises.data.gouv.fr/etablissement/${siret}`;
}

const defs = [
  ["nom", "Nom"],
  ["prenom", "Prénom"],
  ["email", "Adresse courriel"],
  ["telephone", "N° de téléphone"],
  ["dateCreation", "Date de création"],
  ["siret", "Siret"],
  ["statut", "Statut"],
  ["custom:edit", "Action", optionType.FIXED_RIGHT],
];

const columns = columnsTable.buildColumns(defs);

const { query } = route;

const sortableColumns = columns.flatMap((column) =>
  column.options?.isSortable ? [column.key] : [],
);

const statusValue = statusUser.label.map(({ value }) => value);

const nom = ref(query.nom ?? "");
const prenom = ref(query.prenom ?? "");
const email = ref(query.email ?? "");
const statut = ref(statusValue.includes(query.statut) ? query.statut : "");
const getDateCreationLabel = (date) => dayjs(date).format("DD/MM/YYYY");
const { limit, offset, sort, sortDirection } = usePagination(
  query,
  sortableColumns,
);

const getSearchParams = () => ({
  ...(isValidParams(nom.value) ? { nom: nom.value } : {}),
  ...(isValidParams(prenom.value) ? { prenom: prenom.value } : {}),
  ...(isValidParams(email.value) ? { email: email.value } : {}),
  ...(isValidParams(statut.value) ? { statut: statut.value } : {}),
});

let timeout = null;

const updateData = () => {
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => {
    const query = {
      limit: limit.value,
      offset: offset.value,
      ...(isValidParams(sort.value) ? { sortBy: sort.value } : {}),
      ...(isValidParams(sortDirection.value)
        ? { sortDirection: sortDirection.value.toUpperCase() }
        : {}),
      ...getSearchParams(),
    };

    userStore.fetchUsersFo(query);
    navigateTo({ query });
  }, 300);
};

async function validate(userId) {
  const params = { status: statusUser.status.VALIDATED };
  try {
    await userStore.updateUserFoStatus(userId, params);
    toaster.success({
      titleTag: "h2",
      description:
        "La demande de création de compte a été validée par vos soins. L’utilisateur va recevoir un mail pour le prévenir.",
    });
    userStore.fetchUsersFo(query);
  } catch (err) {
    toaster.error({
      titleTag: "h2",
      description: "Erreur lors de la mise à jour du status de l'utilisateur.",
    });
    throw err;
  }
}

async function refused({ commentaire }) {
  const params = { status: statusUser.status.BLOCKED, motif: commentaire };
  await userStore.updateUserFoStatus(
    utilisateurSelectionne.value.userId,
    params,
  );
  userStore.fetchUsersFo(query);
  utilisateurSelectionne.value = null;
  showRefusModal.value = false;
}

async function openRefusedModal(state) {
  utilisateurSelectionne.value = state;
  showRefusModal.value = true;
}
const closeRefusModal = () => {
  utilisateurSelectionne.value = null;
  showRefusModal.value = false;
};

const isLoaded = ref(false);

(async () => {
  await updateData();
  isLoaded.value = true;
})();

onUnmounted(() => {
  if (timeout) {
    clearTimeout(timeout);
  }
});
</script>
<style lang="scss" scoped>
.buttons-group {
  display: flex;
  gap: 0.3rem;
}
</style>
