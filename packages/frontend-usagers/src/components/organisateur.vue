<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-8">
          <DsfrAccordionsGroup>
            <div v-for="(item, index) in organisateurs" :key="index">
              <li>
                <DsfrAccordion
                  :id="index + 1"
                  :title="nomPrenomResponsableOrganisation[index]"
                  :expanded-id="expandedOrganisateurId"
                  @expand="(id) => (expandedOrganisateurId = id)"
                >
                  <Personne
                    :personne="item"
                    :index="index"
                    :show-adresse="false"
                    :show-telephone="true"
                    :show-email="true"
                    @valid="validResponsableOrganisation"
                  >
                  </Personne>
                </DsfrAccordion>
              </li>
            </div>
          </DsfrAccordionsGroup>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-8">
          <DsfrButton
            :label="`Ajouter un organisateur n°${organisateurs?.length + 1}`"
            :disabled="expandedOrganisateurId !== 0"
            :secondary="true"
            @click="addResponsableOrganisation"
          ></DsfrButton>
        </div>
      </div>
    </fieldset>
    <DsfrButton label="Suivant" @click="next" />
  </div>
</template>

<script setup>
import { useUserStore } from "~/stores/user";
const log = logger("components/operateur/organisateur");

const props = defineProps({
  initData: { type: Object, default: null, required: true },
});

const emit = defineEmits(["valid"]);

const userStore = useUserStore();

const organisateurs = ref([{}]);
const expandedOrganisateurId = ref(1);
const metaOrganisateur = ref(true);

const nomPrenomResponsableOrganisation = computed(() => {
  return organisateurs?.value.map((r) => {
    return r.nom
      ? `${r.nom.toUpperCase()}  ${r.prenom.toUpperCase()}`
      : "Nouvel organisateur de séjour - A RENSEIGNER";
  });
});

function addResponsableOrganisation() {
  organisateurs.value.push({});
  expandedOrganisateurId.value = organisateurs.value.length;
}

function validResponsableOrganisation(organisateur, index, meta) {
  log.i("validResponsableOrganisation - IN");
  organisateurs.value[index] = organisateur;
  expandedOrganisateurId.value = 0;
  metaOrganisateur.value = metaOrganisateur.value && meta.value.valid;
}

function next() {
  log.i("next - IN");
  emit(
    "valid",
    {
      organisateurs: organisateurs.value,
      meta: metaOrganisateur.value,
    },
    "organisateurs",
  );
}

onMounted(() => {
  if (props.initData) {
    organisateurs.value = props.initData;
    expandedOrganisateurId.value = 0;
  } else {
    organisateurs.value = {
      nom: userStore.user.nom,
      prenom: userStore.user.prenom,
      email: userStore.user.email,
      telephone: userStore.user.telephone,
    };
    expandedOrganisateurId.value = 1;
  }
});
</script>

<style lang="scss" scoped>
#bloc-connexion {
  color: #000091;
  border-radius: 10px;
  border: solid;
}
</style>
