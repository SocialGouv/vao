<template>
  <dsfr-alert class="fr-mb-6v">
    <Summary :eig="eigStore.currentEig" />
  </dsfr-alert>
  <h6>Type d'événement</h6>
  <div class="fr-fieldset">
    <div class="fr-fieldset__element">
      <DsfrAccordionsGroup v-model="expandedIndex">
        <DsfrAccordion
          :id="1"
          title="Evénements relatifs aux victimes présumées"
        >
          <div class="fr-fieldset">
            <div class="fr-fieldset__element">
              <DsfrCheckboxSet
                v-model="typesValue"
                name="typesValue"
                :disabled="!eigStore.canModify"
                :options="types[eigModel.Categorie.VICTIMES]"
                :error-message="typesValueErrorMessage"
              />
            </div>
            <div
              v-if="
                (typesValue ?? []).includes(
                  eigModel.Types[eigModel.Categorie.VICTIMES].AUTRE,
                )
              "
              class="fr-fieldset__element"
            >
              <DsfrInputGroup
                name="victimesAutrePrecision"
                :required="true"
                :readonly="!eigStore.canModify"
                label="Précisez les événements relatifs aux victimes présumées"
                :label-visible="true"
                :is-textarea="true"
                :model-value="victimesAutrePrecision"
                :error-message="victimesAutrePrecisionrrorMessage"
                :is-valid="victimesAutrePrecisionMeta"
                @update:model-value="victimesAutrePrecisionChange"
              />
            </div>
          </div>
        </DsfrAccordion>
        <DsfrAccordion
          :id="2"
          title="Evènements relatifs à la santé de la personne"
        >
          <div class="fr-fieldset">
            <div class="fr-fieldset__element">
              <DsfrCheckboxSet
                v-model="typesValue"
                name="typesValue"
                :disabled="!eigStore.canModify"
                :options="types[eigModel.Categorie.SANTE]"
                :error-message="typesValueErrorMessage"
              />
            </div>
            <div
              v-if="
                (typesValue ?? []).includes(
                  eigModel.Types[eigModel.Categorie.SANTE].AUTRE,
                )
              "
              class="fr-fieldset__element"
            >
              <DsfrInputGroup
                name="victimesAutrePrecision"
                :required="true"
                :readonly="!eigStore.canModify"
                label="Précisez les événements relatifs à la santé de la personne"
                :label-visible="true"
                :is-textarea="true"
                :model-value="santeAutrePrecision"
                :error-message="santeAutrePrecisionMessage"
                :is-valid="santeAutrePrecisionMeta"
                @update:model-value="santeAutrePrecisionChange"
              />
            </div>
          </div>
        </DsfrAccordion>
        <DsfrAccordion
          :id="3"
          title="Evènements relatifs à la sécurité des biens et des personnes"
        >
          <div class="fr-fieldset">
            <div class="fr-fieldset__element">
              <DsfrCheckboxSet
                v-model="typesValue"
                name="typesValue"
                :disabled="!eigStore.canModify"
                :options="types[eigModel.Categorie.SECURITE]"
                :error-message="typesValueErrorMessage"
              />
            </div>
            <div
              v-if="
                (typesValue ?? []).includes(
                  eigModel.Types[eigModel.Categorie.SECURITE].AUTRE,
                )
              "
              class="fr-fieldset__element"
            >
              <DsfrInputGroup
                name="victimesAutrePrecision"
                :required="true"
                :readonly="!eigStore.canModify"
                label="Précisez les événements relatifs à la sécurité des biens et des personnes"
                :label-visible="true"
                :is-textarea="true"
                :model-value="securiteAutrePrecision"
                :error-message="securiteAutrePrecisionMessage"
                :is-valid="securiteAutrePrecisionMeta"
                @update:model-value="securiteAutrePrecisionChange"
              />
            </div>
          </div>
        </DsfrAccordion>
        <DsfrAccordion
          :id="4"
          title="Evènements relatifs au fonctionnement de l’organisme responsable du séjour"
        >
          <div class="fr-fieldset">
            <div class="fr-fieldset__element">
              <DsfrCheckboxSet
                v-model="typesValue"
                name="typesValue"
                :disabled="!eigStore.canModify"
                :options="types[eigModel.Categorie.FONCTIONNEMENT_ORGANISME]"
                :error-message="typesValueErrorMessage"
              />
            </div>
            <div
              v-if="
                (typesValue ?? []).includes(
                  eigModel.Types[eigModel.Categorie.FONCTIONNEMENT_ORGANISME]
                    .AUTRE,
                )
              "
              class="fr-fieldset__element"
            >
              <DsfrInputGroup
                name="victimesAutrePrecision"
                :required="true"
                :readonly="!eigStore.canModify"
                label="Précisez les événements relatifs au fonctionnement de l’organisme responsable du séjour"
                :label-visible="true"
                :is-textarea="true"
                :model-value="fonctionnementAutrePrecision"
                :error-message="fonctionnementAutrePrecisionMessage"
                :is-valid="fonctionnementAutrePrecisionMeta"
                @update:model-value="fonctionnementAutrePrecisionChange"
              />
            </div>
          </div>
        </DsfrAccordion>
      </DsfrAccordionsGroup>
    </div>
  </div>
  <UtilsNavigationButtons
    :show-buttons="props.showButtons"
    :is-downloading="props.isDownloading"
    :message="props.message"
    :disabled="!meta.valid"
    @next="next"
    @previous="emit('previous')"
  />
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import { eigModel, eigSchema, Summary } from "@vao/shared";
import { mapEigToLabel } from "@vao/shared/src/utils/eigUtils";

const emit = defineEmits(["previous", "next", "update"]);

const props = defineProps({
  isDownloading: { type: Boolean, required: false, default: false },
  message: { type: String, required: false, default: null },
  showButtons: { type: Boolean, required: false, default: true },
});
const eigStore = useEigStore();

const validationSchema = yup.object(eigSchema.eigTypesSchemaCRUD);
const initialValues = {
  types: (eigStore.currentEig?.types ?? []).map((t) => t.type),
  victimesAutrePrecision:
    eigStore.currentEig?.types?.find(
      (t) => t.type === eigModel.Types[eigModel.Categorie.VICTIMES].AUTRE,
    )?.precision ?? "",
  securiteAutrePrecision:
    eigStore.currentEig?.types?.find(
      (t) => t.type === eigModel.Types[eigModel.Categorie.SECURITE].AUTRE,
    )?.precision ?? "",
  santeAutrePrecision:
    eigStore.currentEig?.types?.find(
      (t) => t.type === eigModel.Types[eigModel.Categorie.SANTE].AUTRE,
    )?.precision ?? "",
  fonctionnementAutrePrecision:
    eigStore.currentEig?.types?.find(
      (t) =>
        t.type ===
        eigModel.Types[eigModel.Categorie.FONCTIONNEMENT_ORGANISME].AUTRE,
    )?.precision ?? "",
};

const { meta, values } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

const { value: typesValue, errorMessage: typesValueErrorMessage } =
  useField("types");
const {
  value: victimesAutrePrecision,
  errorMessage: victimesAutrePrecisionrrorMessage,
  meta: victimesAutrePrecisionMeta,
  handleChange: victimesAutrePrecisionChange,
} = useField("victimesAutrePrecision");
const {
  value: securiteAutrePrecision,
  errorMessage: securiteAutrePrecisionMessage,
  meta: securiteAutrePrecisionMeta,
  handleChange: securiteAutrePrecisionChange,
} = useField("securiteAutrePrecision");
const {
  value: santeAutrePrecision,
  errorMessage: santeAutrePrecisionMessage,
  meta: santeAutrePrecisionMeta,
  handleChange: santeAutrePrecisionChange,
} = useField("santeAutrePrecision");
const {
  value: fonctionnementAutrePrecision,
  errorMessage: fonctionnementAutrePrecisionMessage,
  meta: fonctionnementAutrePrecisionMeta,
  handleChange: fonctionnementAutrePrecisionChange,
} = useField("fonctionnementAutrePrecision");

const types = {
  [eigModel.Categorie.VICTIMES]: Object.values(
    eigModel.Types[eigModel.Categorie.VICTIMES],
  ).map((t) => ({
    label: mapEigToLabel[t],
    name: t,
    value: t,
  })),
  [eigModel.Categorie.SANTE]: Object.values(
    eigModel.Types[eigModel.Categorie.SANTE],
  ).map((t) => ({
    label: mapEigToLabel[t],
    name: t,
    value: t,
  })),
  [eigModel.Categorie.SECURITE]: Object.values(
    eigModel.Types[eigModel.Categorie.SECURITE],
  ).map((t) => ({
    label: mapEigToLabel[t],
    name: t,
    value: t,
  })),
  [eigModel.Categorie.FONCTIONNEMENT_ORGANISME]: Object.values(
    eigModel.Types[eigModel.Categorie.FONCTIONNEMENT_ORGANISME],
  ).map((t) => ({
    label: mapEigToLabel[t],
    name: t,
    value: t,
  })),
};

const expandedIndex = ref(-1);

const next = () => {
  if (!eigStore.canModify) {
    return emit("next");
  }

  if (!meta.value.dirty) {
    return emit("next");
  }

  emit(
    "update",
    {
      ...values,
    },
    eigModel.UpdateTypes.TYPE_EVENEMENT,
  );
};
</script>

<style scoped lang="scss"></style>
