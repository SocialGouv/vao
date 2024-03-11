<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <Personnes
            :personnes="organisateurs"
            :show-adresse="false"
            :show-telephone="true"
            :show-email="true"
            titre="Organisateur du séjour"
            :headers="headers"
            @valid="validResponsableOrganisation"
          >
          </Personnes>
        </div>
      </div>
    </fieldset>
    <DsfrButton label="Suivant" @click.prevent="next" />
  </div>
</template>

<script setup>
const log = logger("components/operateur/organisateur");

const props = defineProps({
  initData: { type: Array, required: true },
});

const emit = defineEmits(["next", "update"]);

const organisateurs = ref(props.initData);
const metaOrganisateur = ref(true);
const headers = [
  {
    label: "Nom",
    value: "nom",
  },
  { label: "Prénom", value: "prenom" },
  { label: "Courriel", value: "email" },
  {
    label: "Fonction",
    value: "fonction",
  },
  { label: "Téléphone", value: "telephone" },
];

function validResponsableOrganisation(organisateurs) {
  log.i("validResponsableOrganisation - IN");
  organisateurs.value = organisateurs;
  metaOrganisateur.value = organisateurs.length > 0;
}

function next() {
  log.i("next - IN");
  if (!meta.value.dirty) {
    return emit("next");
  }
  emit(
    "update",
    {
      organisateurs: organisateurs.value,
      meta: metaOrganisateur.value,
    },
    "organisateurs",
  );
}
</script>

<style lang="scss" scoped></style>
