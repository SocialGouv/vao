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
    row-id="id"
    is-sortable
    @update-data="() => updateData()"
  >
    <template #cell-siegeSocial="{ row }">
      {{ row.siegeSocial === true ? "Principal" : "Secondaire" }}
    </template>
    <template #cell-Adresse="{ row }">
      {{ getCommuneCp(row.Adresse) }}
    </template>
    <template #cell-statut="{ row }">
      <div>
        <UserStatusBadge :statut="row.statut" />
      </div>
    </template>
    <template #cell-dateCreation="{ row }">
      {{ getDateCreationLabel(row.dateCreation) }}
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

<script setup lang="ts">
import {
  DsfrDataTableV2Wrapper,
  usePagination,
  isValidParams,
  UserStatusBadge,
  statusUser,
  RefusCompteModal,
  columnsTable,
  useToaster,
  type Columns,
  type NestedKeys,
} from "@vao/shared-ui";
import type { UserDto } from "@vao/shared-bridge";
import dayjs from "dayjs";

type UserStatut = (typeof statusUser.status)[keyof typeof statusUser.status];

type UserListRow = UserDto & {
  userId: string;
  telephone?: string;
  siegeSocial?: boolean;
  Adresse?: string;
  statut: UserStatut;
};

type PaginationQuery = {
  limit: string;
  offset: string;
  sort: string;
  sortDirection: "asc" | "desc" | "";
};

const userStore = useUserStore();
const route = useRoute();
const toaster = useToaster();

const utilisateurSelectionne = ref<UserListRow | null>(null);
const showRefusModal = ref(false);

const data = computed<UserListRow[]>(() => userStore.users as UserListRow[]);
const total = computed(() => userStore.total);

const title = computed(() => `Liste des utilisateurs (${total.value})`);
const getDateCreationLabel = (date: string | Date | null) =>
  date ? dayjs(date).format("DD/MM/YYYY") : "";

const optionType = columnsTable.optionType;

const defs: [string, string, string][] = [
  ["nom", "Nom", optionType.SORTABLE],
  ["prenom", "Prénom", optionType.SORTABLE],
  ["email", "Adresse courriel", optionType.SORTABLE],
  ["telephone", "N° de téléphone", optionType.SORTABLE],
  ["siegeSocial", "Organisme", optionType.SORTABLE],
  ["Adresse", "Ville", optionType.NONE],
  ["statut", "Statut", optionType.SORTABLE],
  ["dateCreation", "Date inscription", optionType.SORTABLE],
  ["custom:edit", "Action", optionType.FIXED_RIGHT],
];

const columns = columnsTable.buildColumns(defs) as Columns<UserListRow>;

const query = route.query as Record<
  string,
  string | string[] | null | undefined
>;

const parseQueryValue = (
  value: string | string[] | null | undefined,
): string => (Array.isArray(value) ? (value[0] ?? "") : (value ?? ""));

const querySearch = {
  nom: parseQueryValue(query.nom),
  prenom: parseQueryValue(query.prenom),
  email: parseQueryValue(query.email),
  statut: parseQueryValue(query.statut),
};

const sortableColumns = columns.flatMap((column) =>
  column.options?.isSortable ? [column.key] : [],
) as NestedKeys<UserListRow>[];

const statusValue = statusUser.label.map(({ value }) => value);

const nom = ref(querySearch.nom);
const prenom = ref(querySearch.prenom);
const email = ref(querySearch.email);
const statut = ref(
  statusValue.includes(querySearch.statut) ? querySearch.statut : "",
);

const paginationQuery: PaginationQuery = {
  limit: parseQueryValue(query.limit) || "10",
  offset: parseQueryValue(query.offset) || "0",
  sort: parseQueryValue(query.sort),
  sortDirection: ((): "asc" | "desc" | "" => {
    const value = parseQueryValue(query.sortDirection);
    return ["asc", "desc", ""].includes(value)
      ? (value as "asc" | "desc" | "")
      : "";
  })(),
};

const { limit, offset, sort, sortDirection } = usePagination<UserListRow>(
  paginationQuery,
  sortableColumns,
);

const getSearchParams = () => ({
  ...(isValidParams(nom.value) ? { nom: nom.value } : {}),
  ...(isValidParams(prenom.value) ? { prenom: prenom.value } : {}),
  ...(isValidParams(email.value) ? { email: email.value } : {}),
  ...(isValidParams(statut.value) ? { statut: statut.value } : {}),
});

let timeout: ReturnType<typeof setTimeout> | null = null;

async function validate(userId: string) {
  const params = { status: statusUser.status.VALIDATED } as Partial<UserDto>;

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
      role: "alert",
    });
    throw err;
  }
}

function openRefusedModal(state: UserListRow) {
  utilisateurSelectionne.value = state;
  showRefusModal.value = true;
}

const closeRefusModal = () => {
  utilisateurSelectionne.value = null;
  showRefusModal.value = false;
};

async function refused({ commentaire }: { commentaire: string }) {
  if (!utilisateurSelectionne.value) {
    return;
  }

  const params = {
    status: statusUser.status.BLOCKED,
    motif: commentaire,
  } as Partial<UserDto>;

  await userStore.updateUserStatus(utilisateurSelectionne.value.id, params);
  userStore.fetchUsersOrganisme(query);
  utilisateurSelectionne.value = null;
  showRefusModal.value = false;
}

function openCompte(userId: string) {
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

const getCommuneCp = (adresse?: string | null) => {
  try {
    const decomposeAdresse = (adresse ?? "").split(" ");
    const cpIndex = decomposeAdresse.findIndex((mot) =>
      regex.formatCommuneCP.test(mot),
    );

    return cpIndex > 0
      ? `${decomposeAdresse.slice(cpIndex + 1).join(" ")} (${decomposeAdresse[cpIndex]})`
      : null;
  } catch (e) {
    console.error("Error while decomposing address", e);
    return "";
  }
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
