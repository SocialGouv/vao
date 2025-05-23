<template>
  <DsfrFieldset>
    <div class="fr-fieldset">
      <div
        class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-3"
      >
        <div class="fr-input-group">
          <DsfrInputGroup
            v-model="searchState.siret"
            type="text"
            name="siret"
            label="SIRET"
            placeholder="SIRET"
            :label-visible="true"
          />
        </div>
      </div>
      <div
        class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-3"
      >
        <div class="fr-input-group">
          <DsfrInputGroup
            v-model="searchState.denomination"
            type="text"
            name="denomination"
            label="Dénomination"
            placeholder="Dénomination"
            :label-visible="true"
          />
        </div>
      </div>
      <div
        class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-3"
      >
        <div class="fr-input-group">
          <DsfrInputGroup
            v-model="searchState.commune"
            type="text"
            name="commune"
            label="Commune"
            placeholder="Commune"
            :label-visible="true"
          />
        </div>
      </div>
      <div
        class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-3"
      >
        <div class="fr-input-group">
          <DsfrSelect
            v-model="searchState.autorisation"
            label="Statut"
            name="Statut"
            :options="[
              'Tous',
              'En activité',
              'Autorisés à organiser des séjours',
              'Fermés',
            ]"
          />
        </div>
      </div>
    </div>
    <div class="fr-fieldset__element">
      <div class="fr-input-group fr-col-12">
        <h4>
          Etablissements secondaires ({{ etablissements.length }}) dont
          {{ openedEtablissements.length }} autorisé(s) à organiser des séjours
          et {{ authorizedEtablissements.length }} activé(s)
        </h4>
        <DsfrDataTableV2Wrapper
          v-model:limit="limit"
          v-model:offset="offset"
          :columns="columns"
          :data="fitleredEtablissements.slice(offset, offset + limit)"
          :total="fitleredEtablissements?.length ?? 0"
          row-id="siret"
          @update-data="updateData"
        >
          <template #cell-custom:edit="{ row }">
            <DsfrToggleSwitch
              :model-value="row.enabled"
              :disabled="
                !props.modifiable ||
                (!row.enabled && !(row.etatAdministratif === 'En activité'))
              "
              :inactive-text="
                row.etatAdministratif === 'En activité' ? 'Désactivé' : 'Fermé'
              "
              @update:model-value="() => enableEtablissements(row.siret)"
            ></DsfrToggleSwitch>
          </template>
        </DsfrDataTableV2Wrapper>
      </div>
      <div v-if="props.showButtons" class="fr-fieldset__element">
        <DsfrButton
          id="refresh-etablissement-sec"
          size="sm"
          :secondary="true"
          @click.prevent="refreshEtablissmentsSecondaires"
          >Rafraichir la liste des établissements secondaires
        </DsfrButton>
      </div>
      <div v-if="props.showButtons" class="fr-fieldset__element">
        <UtilsNavigationButtons
          :is-downloading="props.isDownloading"
          :message="props.message"
          :disabled="!meta.valid"
          @next="next"
          @previous="emit('previous')"
        />
      </div>
    </div>
  </DsfrFieldset>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import { DsfrToggleSwitch } from "@gouvminint/vue-dsfr";
import { DsfrDataTableV2Wrapper } from "@vao/shared";

const emit = defineEmits(["previous", "next", "update"]);

const log = logger("components/organisme/personne-morale");
const toaster = useToaster();

const organismeStore = useOrganismeStore();

const siret = computed(
  () => organismeStore.organismeCourant.personneMorale.siret,
);

const props = defineProps({
  showButtons: { type: Boolean, default: true },
  modifiable: { type: Boolean, default: true },
  isDownloading: { type: Boolean, required: false, default: false },
  message: { type: String, required: false, default: null },
});

const validationSchema = computed(() =>
  yup.object(organisme.etablissementsSecondaireSchema),
);

const { meta, values, setValues } = useForm({
  validationSchema,
  initialValues: {
    etablissements:
      organismeStore.organismeCourant.personneMorale.etablissements ?? [],
  },
});

onMounted(async () => {
  if (
    !organismeStore.organismeCourant.personneMorale.etablissements ||
    organismeStore.organismeCourant.personneMorale.etablissements.length === 0
  ) {
    refreshEtablissmentsSecondaires();
  }
});

const { value: etablissements } = useField("etablissements");

const openedEtablissements = computed(() =>
  etablissements.value.filter((e) => e.etatAdministratif === "En activité"),
);

const authorizedEtablissements = computed(() =>
  etablissements.value.filter((e) => e.enabled),
);

const searchState = ref({
  siret: "",
  denomination: "",
  commune: "",
  autorisation: "Autorisés à organiser des séjours",
});

const fitleredEtablissements = computed(() => {
  return etablissements.value.filter((e) => {
    // filtering conditions
    const elements = [
      () => (!props.modifiable ? e.enabled : e),
      () => new RegExp(searchState.value.siret, "i").test(e.siret),
      () =>
        new RegExp(searchState.value.denomination, "i").test(e.denomination),
      () => new RegExp(searchState.value.commune, "i").test(e.commune),
      () => {
        if (searchState.value.autorisation === "Tous") return true;
        if (
          (searchState.value.autorisation === "En activité" && e.enabled) ||
          (searchState.value.autorisation === "Fermés" && !e.enabled) ||
          (searchState.value.autorisation ===
            "Autorisés à organiser des séjours" &&
            e.etatAdministratif === "En activité")
        )
          return true;
        return false;
      },
    ];
    return elements.every((cb) => cb());
  });
});

const defaultLimit = 10;
const defaultOffset = 0;
const limit = ref(defaultLimit);
const offset = ref(defaultOffset);

const columns = [
  {
    key: "siret",
    label: "SIRET",
  },
  {
    key: "denomination",
    label: "Dénomination",
  },
  {
    key: "adresse",
    label: "Adresse",
  },
  {
    key: "codePostal",
    label: "Code postal",
  },
  {
    key: "commune",
    label: "Commune",
  },
  {
    key: "custom:edit",
    label: "Action",
    options: {
      isFixedRight: true,
    },
  },
];

const enableEtablissements = (siret) => {
  setValues({
    etablissements: [...etablissements.value].reduce((acc, curr) => {
      if (curr.siret === siret) {
        acc.push({ ...curr, enabled: !curr.enabled });
      } else {
        acc.push(curr);
      }

      return acc;
    }, []),
  });
};

async function refreshEtablissmentsSecondaires() {
  log.i("searchOrganismeBySiret - IN");
  const url = `/siret/${siret.value}`;

  try {
    const data = await $fetchBackend(url, {
      method: "GET",
      credentials: "include",
    });

    const newList = [];
    for (const refreshedEtablissement of data.etablissements) {
      newList.push({
        ...refreshedEtablissement,
        enabled:
          etablissements.value?.find(
            (e) => e.siret === refreshedEtablissement.siret,
          )?.enabled ?? false,
      });
    }

    etablissements.value = newList;
  } catch (error) {
    toaster.error({
      titleTag: "h2",
      description:
        "erreur lors du rafraichissment des établissements secondaires",
    });
    log.w("searchOrganismeBySiret - erreur:", { error });
    return null;
  }
}

function next() {
  log.i("next - IN");
  if (!meta.value.dirty) {
    return emit("next");
  }
  emit(
    "update",
    {
      ...values,
    },
    "etablissements_secondaires",
  );
}
</script>

<style scoped></style>
