<template>
  <div id="agrement-coordonnees">
    <div id="personne-physique">
      <div
        v-if="props.initOrganisme.typeOrganisme === 'personne_physique'"
        class="fr-col-10"
      >
        <TitleWithIcon
          icon="fr-icon-account-pin-circle-fill"
          :level="3"
          title-class="fr-text--lead fr-mb-0"
        >
          Personne physique
        </TitleWithIcon>
        <dl>
          <dt>
            <strong>Prénom: </strong>
          </dt>
          <dd>{{ props.initOrganisme?.personnePhysique.prenom || "-" }}</dd>
          <dt>
            <strong>Nom: </strong>
          </dt>
          <dd>{{ props.initOrganisme?.personnePhysique.nom || "-" }}</dd>
          <dt>
            <strong>Profession: </strong>
          </dt>
          <dd>{{ props.initOrganisme?.personnePhysique.profession || "-" }}</dd>
          <dt>
            <strong>Téléphone: </strong>
          </dt>
          <dd>
            {{ props.initOrganisme?.personnePhysique.telephone || "-" }}
          </dd>
          <dt>
            <strong>Adresse du siège de ses activité: </strong>
          </dt>
          <dd>
            {{
              props.initOrganisme?.personnePhysique.adresseDomicileLabel || "-"
            }}
          </dd>
          <dt>
            <strong>Adresse de ses activités: </strong>
          </dt>
          <dd>
            {{ props.initOrganisme?.personnePhysique.adresseSiegeLabel || "-" }}
          </dd>
        </dl>
      </div>
      <hr class="fr-my-2w" />
      <div class="fr-col-10">
        <TitleWithIcon
          icon="fr-icon-building-line"
          :level="3"
          title-class="fr-text--lead fr-mb-0"
        >
          Personne morale
        </TitleWithIcon>
        <dl class="fr-text--sm fr-pl-0">
          <dt><strong>Dénomination sociale:</strong></dt>
          <dd>
            {{ props.initOrganisme?.personneMorale?.raisonSociale || "-" }}
          </dd>
          <dt><strong>Statut, forme juridique:</strong></dt>
          <dd>{{ props.initOrganisme?.personneMorale?.statut || "-" }}</dd>

          <dt><strong>Téléphone:</strong></dt>
          <dd>
            {{ props.initOrganisme?.personneMorale?.telephone || "-" }}
          </dd>
          <dt><strong>Email:</strong></dt>
          <dd>
            {{ props.initOrganisme?.personneMorale?.email || "-" }}
          </dd>
          <dt><strong>Adresse du siège social:</strong></dt>
          <dd>{{ props.initOrganisme?.personneMorale?.adresse || "-" }}</dd>
        </dl>

        <h4 class="fr-text--lg fr-mt-4w">Représentant legal</h4>

        <div
          v-for="(rep, idx) in representants"
          :key="Number(idx)"
          class="fr-mb-4w"
          :data-idx="Number(idx)"
        >
          <template v-if="Number(idx) > 0">
            <h5 class="fr-text--md fr-mb-1w">
              Représentant n°{{ Number(idx) + 1 }}
            </h5>
          </template>
          <dl class="fr-text--sm fr-pl-0">
            <dt><strong>Prénom:</strong></dt>
            <dd>{{ rep.prenom || "-" }}</dd>
            <dt><strong>Nom:</strong></dt>
            <dd>{{ rep.nom || "-" }}</dd>
            <dt><strong>Téléphone:</strong></dt>
            <dd>{{ rep.telephoneRepresentant || "-" }}</dd>
            <dt><strong>Email:</strong></dt>
            <dd>{{ rep.emailRepresentant || "-" }}</dd>
            <dt><strong>Adresse du domicile:</strong></dt>
            <dd>
              {{
                rep.adresseDomicile && rep.adresseDomicile.label
                  ? rep.adresseDomicile.label
                  : rep.adresseDomicile
                    ? rep.adresseDomicile
                    : "-"
              }}
            </dd>
          </dl>
        </div>
      </div>
    </div>

    <h4 class="fr-text--lg fr-mt-4w">Procès verbal</h4>
    <FileUpload
      v-model="fileProcesVerbal"
      :cdn-url="props.cdnUrl"
      label="Dernier procès verbal d'assemblée générale"
      :modifiable="false"
    />
    <hr class="fr-mt-4w" />
    <DisplayInputCommon
      :value="props.initAgrement.commentaire"
      :input="AgrementDisplayInput.AgrementInput['commentaire']"
    />
  </div>
</template>

<script setup lang="ts">
import {
  FileUpload,
  TitleWithIcon,
  DisplayInputCommon,
  AgrementDisplayInput,
} from "@vao/shared-ui";
import { getFileByCategory, FILE_CATEGORY } from "@vao/shared-bridge";

const props = defineProps({
  valid: { type: Boolean, default: true },
  initAgrement: { type: Object, required: true },
  initOrganisme: { type: Object, required: true },
  modifiable: { type: Boolean, default: true },
  cdnUrl: { type: String, required: true },
});

const representants = computed(
  () => props.initOrganisme?.personneMorale?.representantsLegaux || [],
);
const fileProcesVerbal = computed(() => {
  return getFileByCategory({
    files: props.initAgrement?.agrementFiles,
    category: FILE_CATEGORY.PROCVERBAL,
  });
});
</script>

<style scoped>
dl {
  display: grid;
  grid-template-columns: 220px 1fr;
  row-gap: 0.5rem;
  column-gap: 1rem;
  margin: 0;
}
dd {
  padding-left: 0;
}
.full-width {
  grid-column: 1 / span 2;
}
</style>
