<template>
  <div>
    <div id="generales">
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
    </div>
    <div id="agrement">
      <div v-if="layoutStore.stepperIndex === 2">
        <OperateurAgrement
          :init-data="operateurCourant"
          @valid="updateAgrement"
        ></OperateurAgrement>
      </div>
    </div>
    <div id="transport">
      <div v-if="layoutStore.stepperIndex === 3">
        <protocole-transport
          :init-data="operateurCourant.protocoleTransport ?? {}"
          @valid="update"
        ></protocole-transport>
      </div>
    </div>
    <div id="sanitaire">
      <div v-if="layoutStore.stepperIndex === 4">
        <protocole-sanitaire
          :init-data="operateurCourant.protocoleSanitaire ?? {}"
          @valid="update"
        ></protocole-sanitaire>
      </div>
    </div>
    <div id="organisateurs">
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
    </div>
    <div id="synthse">
      <div v-if="layoutStore.stepperIndex === 6">
        <OperateurSynthese
          :init-data="operateurCourant"
          @valid="finalizeOperateur"
        ></OperateurSynthese>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import { useLayoutStore } from "@/stores/layout";
import { useOperateurStore } from "@/stores/operateur";
import { logger } from "#imports";
import { watch } from "vue";

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
      ? `/operateur/${route.params.idOperateur}`
      : "/operateur";
    const data = await $fetchBackend(url, {
      method: "POST",
      credentials: "include",
      body: {
        parametre: { ...operatorData },
        type: typeOperateur.value,
      },
    });

    const operateurId = data.operateurId;
    log.d(`operateur ${operateurId} mis à jour`);
    await operateurStore.setMyOperateur();
    toaster.success("Fiche opérateur sauvegardée");
    layoutStore.stepperIndex++;
  } catch (error) {
    log.w("Creation/modification d'operateur : ", { error });
  }
}

async function update(operatorData, type) {
  log.i("update - IN");
  log.d(operatorData);
  try {
    const url = `/operateur/${operateurCourant.value.operateurId}`;
    const data = await useFetch(url, {
      method: "POST",
      credentials: "include",
      body: {
        parametre: { ...operatorData },
        type,
      },
    });
    const operateurId = data.operateurId;
    log.d(`operateur ${operateurId} mis à jour`);
    await operateurStore.setMyOperateur();
    toaster.success("Fiche opérateur sauvegardée");
    layoutStore.stepperIndex++;
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
    const url = `/operateur/${operateurCourant.value.operateurId}`;
    const data = await $fetchBackend(url, {
      method: "POST",
      credentials: "include",
      body: {
        parametre: {},
        type: "synthese",
      },
    });
    const operateurId = data.operateurId;
    log.d(`operateur ${operateurId} finalisé`);
    await operateurStore.setMyOperateur();
    toaster.success("Fiche organisme finalisée");
    return navigateTo("/");
  } catch (error) {
    log.w("Creation/modification d'operateur : ", { error });
  }
}

watch(
  () => route.hash,
  (oldValue, newValue) => {
    log.i("oldValue, newValue");
    log.i(oldValue, newValue);
    if (route.hash === "#agrement") {
      layoutStore.stepperIndex = 2;
    }
    if (route.hash === "#transport") {
      layoutStore.stepperIndex = 3;
    }
    if (route.hash === "#sanitaire") {
      layoutStore.stepperIndex = 4;
    }
    if (route.hash === "#organisateurs") {
      layoutStore.stepperIndex = 5;
    }
    if (route.hash === "#synthese") {
      layoutStore.stepperIndex = 6;
    }
    if (!route.hash || route.hash === "#generales") {
      layoutStore.stepperIndex = 1;
    }
  },
);

onMounted(async () => {
  if (route.hash === "#agrement") {
    layoutStore.stepperIndex = 2;
  }
  if (route.hash === "#transport") {
    layoutStore.stepperIndex = 3;
  }
  if (route.hash === "#sanitaire") {
    layoutStore.stepperIndex = 4;
  }
  if (route.hash === "#organisateurs") {
    layoutStore.stepperIndex = 5;
  }
  if (route.hash === "#synthese") {
    layoutStore.stepperIndex = 6;
  }
  if (!route.hash || route.hash === "#generales") {
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
