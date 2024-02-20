<template>
  <div class="fr-grid-row fr-px-3w">
    <div class="fr-col-3">
      <OperateurMenuOperateur
        :active-id="hash"
        :operateur="operateurStore.operateurCourant"
      ></OperateurMenuOperateur>
    </div>

    <div class="fr-col-9 fr-py-3w">
      <OperateurStepper :step="hash"></OperateurStepper>
      <div>
        <div id="info-generales">
          <div v-if="hash === 'info-generales'">
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
                @valid="updateOrCreate"
              ></OperateurPersonneMorale>
            </div>
            <div v-if="typeOperateur === 'personne_physique'">
              <OperateurPersonnePhysique
                :init-data="operateurCourant.personnePhysique ?? {}"
                @valid="updateOrCreate"
              ></OperateurPersonnePhysique>
            </div>
          </div>
        </div>
        <div id="agrement">
          <OperateurAgrement
            v-if="hash === 'agrement'"
            :init-data="operateurCourant"
            @valid="nextHash(hash)"
          ></OperateurAgrement>
        </div>
        <div id="protocole-transport">
          <protocole-transport
            v-if="hash === 'protocole-transport'"
            :init-data="operateurCourant.protocoleTransport ?? {}"
            @valid="updateOrCreate"
          ></protocole-transport>
        </div>
        <div id="protocole-sanitaire">
          <protocole-sanitaire
            v-if="hash === 'protocole-sanitaire'"
            :init-data="operateurCourant.protocoleSanitaire ?? {}"
            @valid="updateOrCreate"
          ></protocole-sanitaire>
        </div>
        <div id="organisateurs">
          <Organisateur
            v-if="hash === 'organisateurs'"
            :init-data="operateurCourant.organisateurs ?? []"
            @valid="updateOrCreate"
          >
          </Organisateur>
        </div>
        <div id="synthese">
          <OperateurSynthese
            v-if="hash === 'synthese'"
            :init-data="operateurCourant"
            @valid="finalizeOperateur"
          ></OperateurSynthese>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";

const route = useRoute();
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;
const log = logger("pages/operateur/idOperateur");

definePageMeta({
  middleware: ["is-connected", "has-id-operateur"],
  layout: "operateur",
});

const operateurStore = useOperateurStore();

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

const sommaireOptions = organismeMenus.map((m) => m.id);

const hash = computed(() => {
  if (route.hash) {
    return route.hash.slice(1);
  }
  return sommaireOptions[0];
});

function previousHash(hash) {
  const index = sommaireOptions.findIndex((o) => o === hash);
  return navigateTo({ hash: "#" + sommaireOptions[index - 1] });
}

function nextHash(hash) {
  const index = sommaireOptions.findIndex((o) => o === hash);
  log.i({ hash, index, next: sommaireOptions[index + 1] });
  return navigateTo({ hash: "#" + sommaireOptions[index + 1] });
}

async function updateOrCreate(operatorData) {
  log.i("updateOrCreate - IN");
  log.d(operatorData);
  try {
    const url = route.params.idOperateur
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
    return nextHash(hash.value);
  } catch (error) {
    log.w("Creation/modification d'operateur : ", { error });
  }
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

onMounted(async () => {
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
