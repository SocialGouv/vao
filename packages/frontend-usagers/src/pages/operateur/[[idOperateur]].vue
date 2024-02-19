<template>
  <div>
    <div v-if="layoutStore.stepperIndex === 1">
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
          :init-data="operateurCourant.personneMorale ?? {}"
          @valid="UpdateOrCreate"
        ></OperateurPersonneMorale>
      </div>
      <div v-if="typeOperateur === 'personne_physique'">
        <OperateurPersonnePhysique
          :init-data="operateurCourant.personnePhysique ?? {}"
          @valid="UpdateOrCreate"
        ></OperateurPersonnePhysique>
      </div>
    </div>
    <div v-if="layoutStore.stepperIndex === 2">
      <OperateurAgrement
        :init-data="operateurCourant"
        @valid="updateAgrement"
      ></OperateurAgrement>
    </div>
    <div id="transport">
      <div v-if="layoutStore.stepperIndex === 3">
        <protocole-transport
          :init-data="operateurCourant.protocoleTransport ?? {}"
          @valid="update"
        ></protocole-transport>
      </div>
    </div>
    <div v-if="layoutStore.stepperIndex === 4">
      <protocole-sanitaire
        :init-data="operateurCourant.protocoleSanitaire ?? {}"
        @valid="update"
      ></protocole-sanitaire>
    </div>
    <div v-if="layoutStore.stepperIndex === 5">
      <Organisateur
        :init-data="operateurCourant.organisateurs ?? []"
        @valid="update"
      >
      </Organisateur>
      <!-- <OperateurOrganisateur -->
      <!-- :init-data="operateurCourant.organisateurs ?? []" -->
      <!-- @valid="update" -->
      <!-- ></OperateurOrganisateur> -->
    </div>
    <div v-if="layoutStore.stepperIndex === 6">
      <OperateurSynthese
        :init-data="operateurCourant"
        @valid="finalizeOperateur"
      ></OperateurSynthese>
    </div>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import { useLayoutStore } from "@/stores/layout";
import { useOperateurStore } from "@/stores/operateur";
const route = useRoute();
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;
const log = logger("pages/operateur/idOperateur");

definePageMeta({
  middleware: ["is-connected", "has-id-operateur"],
  layout: "operateur",
});

const operateurStore = useOperateurStore();
const layoutStore = useLayoutStore();

const operateurCourant = computed(() => {
  return operateurStore.operateurCourant;
});

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

const isUpdate = computed(() => {
  return !!route.params.idOperateur;
});

// Schéma et données de base
const schemaBase = {
  typeOperateur: yup.string().required(),
};
const validationSchemaBase = computed(() => {
  return yup.object({ ...schemaBase });
});
const initialValuesBase = computed(() => {
  return {
    typeOperateur: operateurCourant.value.typeOperateur ?? "",
  };
});
const { resetForm: resetFormBase } = useForm({
  initialValues: initialValuesBase,
  validationSchema: validationSchemaBase,
});
const {
  value: typeOperateur,
  errorMessage: typeOperateurErrorMessage,
  handleChange: onTypeOperateurChange,
  meta: typeOperateurMeta,
} = useField("typeOperateur");

async function UpdateOrCreate(operatorData) {
  log.i("UpdateOrCreate - IN");
  log.d(operatorData);
  try {
    const url = isUpdate.value
      ? `/front-server/operateur/${route.params.idOperateur}`
      : "/front-server/operateur";
    const { data, error } = await useFetch(url, {
      method: "POST",
      body: {
        parametre: { ...operatorData },
        type: typeOperateur.value,
      },
    });
    if (data.value) {
      const operateurId = data.value.operateurId;
      log.d(`operateur ${operateurId} mis à jour`);
      await operateurStore.setMyOperateur();
      toaster.success("Fiche opérateur sauvegardée");
      layoutStore.stepperIndex++;
    }
    if (error.value) {
      log.w(error.value);
      toaster.error(`Creation/modification d'operateur : ${error.value}`);
    }
  } catch (error) {
    log.w("Creation/modification d'operateur : ", { error });
  }
}

async function update(operatorData, type) {
  log.i("update - IN");
  log.d(operatorData);
  try {
    const url = `/front-server/operateur/${operateurCourant.value.operateurId}`;
    const { data, error } = await useFetch(url, {
      method: "POST",
      body: {
        parametre: { ...operatorData },
        type,
      },
    });
    if (data.value) {
      const operateurId = data.value.operateurId;
      log.d(`operateur ${operateurId} mis à jour`);
      await operateurStore.setMyOperateur();
      toaster.success("Fiche opérateur sauvegardée");
      layoutStore.stepperIndex++;
    }
    if (error.value) {
      log.w(error.value);
      toaster.error(`Creation/modification d'operateur : ${error.value}`);
    }
  } catch (error) {
    log.w("Creation/modification d'operateur : ", { error });
  }
}

function updateAgrement() {
  log.i("updateAgrement - IN");
  layoutStore.stepperIndex++;
}

async function finalizeOperateur() {
  log.i("finalizeOperateur - IN");
  try {
    const url = `/front-server/operateur/${operateurCourant.value.operateurId}`;
    const { data, error } = await useFetch(url, {
      method: "POST",
      body: {
        parametre: {},
        type: "synthese",
      },
    });
    if (data.value) {
      const operateurId = data.value.operateurId;
      log.d(`operateur ${operateurId} finalisé`);
      await operateurStore.setMyOperateur();
      toaster.success("Fiche organisme finalisée");
      return navigateTo("/");
    }
    if (error.value) {
      log.w(error.value);
      toaster.error(`Creation/modification d'operateur : ${error.value}`);
    }
  } catch (error) {
    log.w("Creation/modification d'operateur : ", { error });
  }
}

watch(route, () => {
  log.i(route.hash);
  if (route.hash === "agrement") {
    log.i("Agrément !");
    layoutStore.stepperIndex = 2;
  }
  if (route.hash === "#transport") {
    log.i("transport !");
    layoutStore.stepperIndex = 3;
  }
  if (!route.hash || route.hash === "generales") {
    layoutStore.stepperIndex = 1;
  }
});

onMounted(async () => {
  log.i("route.hash");
  log.i(route.hash);
  if (route.hash === "agrement") {
    log.i("Agrément !");
    layoutStore.stepperIndex = 2;
  }
  if (route.hash === "transport") {
    log.i("transport !");
    layoutStore.stepperIndex = 3;
  }
  if (!route.hash || route.hash === "generales") {
    layoutStore.stepperIndex = 1;
  }
  await operateurStore.setMyOperateur();
  resetFormBase({ values: initialValuesBase.value });
});
</script>

<style lang="scss" scoped>
#bloc-connexion {
  color: #000091;
  border-radius: 10px;
  border: solid;
}
</style>
