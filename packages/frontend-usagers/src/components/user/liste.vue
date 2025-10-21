<template>
  <UserListeFilters
    v-model:email="email"
    v-model:nom="nom"
    v-model:prenom="prenom"
    v-model:statut="statut"
    :status-actions="statusUser.label"
    @filters-update="() => updateData(true)"
  />
  <DsfrDataTableV2Wrapper
    v-model:limit="limit"
    v-model:offset="offset"
    v-model:sort="sort"
    v-model:sort-direction="sortDirection"
    :columns="columns"
    :table-title="title"
    :data="data"
    :total="total"
    row-id="userId"
    is-sortable
    @update-data="() => updateData()"
  >
    <template #cell-siegeSocial="{ cell }">
      {{ cell === true ? "Principal" : "Secondaire" }}
    </template>
    <template #cell-Adresse="{ cell }">
      {{ getCommuneCp(cell) }}
    </template>
    <template #cell-statut="{ cell }">
      <div>
        <UserStatusBadge :statut="cell" />
      </div>
    </template>
    <template #cell-dateCreation="{ cell }">
      {{ getDateCreationLabel(cell) }}
    </template>
    <template #cell-custom:edit="{ row }">
      <div class="buttons-group">
        <DsfrButton
          v-if="
            row.statut === statusUser.status.VALIDATED ||
            row.statut === statusUser.status.BLOCKED
          "
          icon="ri:arrow-right-s-line"
          icon-only
          primary
          size="small"
          type="button"
          title="Naviguer vers le compte"
          @click="openCompte(row.userId)"
        />
        <DsfrButton
          v-if="row.statut === statusUser.status.NEED_SIRET_VALIDATION"
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
          v-if="row.statut === statusUser.status.NEED_SIRET_VALIDATION"
          class="button--danger"
          :icon="'ri:close-line'"
          icon-only
          secondary
          size="small"
          type="button"
          :label="'Refuser le compte'"
          @click="openRefusedModal(row)"
        />
      </div>
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

const utilisateurSelectionne = ref(null);
const showRefusModal = ref(false);

const data = computed(() => userStore.users);
const total = computed(() => userStore.total);

const title = computed(() => `Liste des utilisateurs (${total.value})`);
const getDateCreationLabel = (date) => dayjs(date).format("DD/MM/YYYY");

const optionType = columnsTable.optionType;

const defs = [
  ["nom", "Nom", optionType.SORTABLE],
  ["prenom", "Prénom", optionType.SORTABLE],
  ["email", "Adresse courriel", optionType.SORTABLE],
  ["telephone", "N° de téléphone", optionType.SORTABLE],
  ["siegeSocial", "Organisme", optionType.SORTABLE],
  ["Adresse", "Ville", optionType.SORTABLE],
  ["statut", "Statut", optionType.SORTABLE],
  ["dateCreation", "Date inscription", optionType.SORTABLE],
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

async function validate(userId) {
  const params = { status: statusUser.status.VALIDATED };
  try {
    await userStore.updateUserStatus(userId, params);
    toaster.success({
      titleTag: "h2",
      description:
        "La demande de création de compte a été validée par vos soins. L’utilisateur va recevoir un mail pour le prévenir.",
    });
    userStore.fetchUsersOrganisme(query);
  } catch (err) {
    toaster.error({
      titleTag: "h2",
      description: "Erreur lors de la mise à jour du status de l'utilisateur.",
    });
    throw err;
  }
}

async function openRefusedModal(state) {
  utilisateurSelectionne.value = state;
  showRefusModal.value = true;
}
const closeRefusModal = () => {
  utilisateurSelectionne.value = null;
  showRefusModal.value = false;
};

async function refused({ commentaire }) {
  const params = { status: statusUser.status.BLOCKED, motif: commentaire };
  await userStore.updateUserStatus(utilisateurSelectionne.value.userId, params);
  userStore.fetchUsersOrganisme(query);
  utilisateurSelectionne.value = null;
  showRefusModal.value = false;
}

async function openCompte(userId) {
  navigateTo(`/comptes/${userId}`);
}

const updateData = (resetOffset = false) => {
  if (resetOffset) {
    offset.value = 0;
  }
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

    userStore.fetchUsersOrganisme(query);
    navigateTo({ query });
  }, 300);
};

const getCommuneCp = (adresse) => {
  const decomposeAdresse = adresse.split(" ");
  const cpIndex = decomposeAdresse.findIndex((mot) =>
    regex.formatCommuneCP.test(mot),
  );
  return cpIndex > 0
    ? `${decomposeAdresse.slice(cpIndex + 1).join(" ")} (${decomposeAdresse[cpIndex]})`
    : null;
};
updateData();

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
