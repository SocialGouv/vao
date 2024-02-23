<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrRadioButtonSet
            name="typeOperateur"
            legend="Type de personne qui organise des séjours"
            :required="true"
            :model-value="typeOperateur"
            :options="typeOptions"
            :is-valid="typeOperateurMeta"
            :inline="false"
            :error-message="typeOperateurErrorMessage"
            @update:model-value="onTypeOperateurChange"
          />
        </div>
      </div>
    </fieldset>
    <div v-if="typeOperateur === 'personne_morale'">
      <OperateurPersonneMorale
        :init-data="initData.personneMorale ?? {}"
        @valid="valid"
      ></OperateurPersonneMorale>
    </div>
    <div v-if="typeOperateur === 'personne_physique'">
      <OperateurPersonnePhysique
        :init-data="initData.personnePhysique ?? {}"
        @valid="valid"
      ></OperateurPersonnePhysique>
    </div>
  </div>
</template>

<script setup>
import { useField } from "vee-validate";

const props = defineProps({
  initData: { type: Object, default: null, required: true },
});

const emit = defineEmits(["valid"]);

function valid(data, type) {
  emit("valid", data, type);
}
// Schéma et données de base
// const schemaBase = {
//   typeOperateur: yup.string().required(),
// };
// const validationSchemaBase = computed(() => {
//   return yup.object({ ...schemaBase });
// });
// const initialValuesBase = computed(() => {
//   return {
//     typeOperateur: props.initData.value.typeOperateur ?? "",
//   };
// });
// const { resetForm: resetFormBase } = useForm({
//   initialValues: initialValuesBase,
//   validationSchema: validationSchemaBase,
// });

const typeOptions = [
  {
    label: "Personne physique",
    value: "personne_physique",
  },
  {
    label: "Personne morale",
    value: "personne_morale",
  },
];

const {
  value: typeOperateur,
  errorMessage: typeOperateurErrorMessage,
  handleChange: onTypeOperateurChange,
  meta: typeOperateurMeta,
} = useField("typeOperateur");

onMounted(() => {
  typeOperateur.value = props.initData.typeOperateur;
});
</script>

<style lang="scss" scoped></style>
