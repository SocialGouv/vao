<template>
  <h4 class="fr-text--lg fr-mt-4w">Représentant legal</h4>

  <div
    v-for="(representant, idx) in representantsList"
    :key="idx"
    class="fr-mb-4w fr-mt-4w"
  >
    <div class="fr-mb-2w">
      <div class="container-flex-between">
        <h5 class="fr-text--md fr-mb-0">Représentant n°{{ idx + 1 }}</h5>
        <div class="container-flex-between">
          <template v-if="props.modifiable">
            <DsfrLinkV2
              v-if="!representant.isEditing"
              as="button"
              icon-name="icon-edit-line"
              @click="editRepresentant(idx)"
            >
              Modifier le représentant {{ idx + 1 }}
            </DsfrLinkV2>
          </template>
          <DsfrButton
            v-if="props.modifiable"
            secondary
            @click="removeRepresentant(idx)"
          >
            Supprimer le représentant {{ idx + 1 }}
          </DsfrButton>
        </div>
      </div>
      <!-- Boutons d'édition d'un existant -->
      <div
        v-if="representant.isEditing && representant._backup"
        class="container-flex-end fr-mt-2w"
      >
        <DsfrButton
          icon="fr-icon-save-line"
          icon-only
          primary
          @click="saveRepresentant(idx)"
        >
          <span class="fr-sr-only"
            >Enregistrer les modifications du représentant {{ idx + 1 }}</span
          >
        </DsfrButton>
        <DsfrButton
          icon="fr-icon-close-line"
          icon-only
          secondary
          @click="cancelEditRepresentant(idx)"
        >
          <span class="fr-sr-only"
            >Annuler les modifications du représentant {{ idx + 1 }}</span
          >
        </DsfrButton>
      </div>
    </div>
    <template v-if="representant.isEditing">
      <form @submit.prevent>
        <DsfrInputGroup
          name="prenom"
          label="Prénom"
          :label-visible="true"
          :model-value="representant.prenom"
          :is-valid="!representant.errors.prenom"
          :error-message="representant.errors.prenom"
          :disabled="!props.modifiable"
          hint="Saisissez le premier prénom. Exemple: Pierre"
          @update:model-value="
            (val) => {
              representant.prenom = val;
              validateField(representant, 'prenom');
            }
          "
        />
        <DsfrInputGroup
          name="nom"
          label="Nom"
          :label-visible="true"
          :model-value="representant.nom"
          :is-valid="!representant.errors.nom"
          :error-message="representant.errors.nom"
          :disabled="!props.modifiable"
          hint="Saisissez le nom d'usage. Exemple: Dupont"
          @update:model-value="
            (val) => {
              representant.nom = val;
              validateField(representant, 'nom');
            }
          "
        />
        <DsfrInputGroup
          name="fonction"
          label="Fonction"
          :label-visible="true"
          :model-value="representant.fonction"
          :is-valid="!representant.errors.fonction"
          :error-message="representant.errors.fonction"
          :disabled="!props.modifiable"
          hint="Saisissez la fonction du représentant. Exemple : Président"
          @update:model-value="
            (val) => {
              representant.fonction = val;
              validateField(representant, 'fonction');
            }
          "
        />
      </form>
      <!-- Boutons d'ajout d'un nouveau représentant -->
      <div
        v-if="props.modifiable && !representant._backup"
        class="container-flex-start fr-mt-4w"
      >
        <DsfrButton
          icon-name="icon-save-line"
          secondary
          @click="saveRepresentant(idx)"
        >
          Ajouter le représentant
        </DsfrButton>
        <DsfrButton
          icon-name="icon-close-line"
          secondary
          @click="cancelEditRepresentant(idx)"
        >
          Annuler l'ajout du représentant
        </DsfrButton>
      </div>
    </template>
    <template v-else>
      <dl class="fr-text--sm fr-pl-0">
        <dt><strong>Prénom:</strong></dt>
        <dd>{{ representant.prenom || "-" }}</dd>
        <dt><strong>Nom:</strong></dt>
        <dd>{{ representant.nom || "-" }}</dd>
        <dt><strong>Fonction:</strong></dt>
        <dd>{{ representant.fonction || "-" }}</dd>
      </dl>
      <!-- Affichage des erreurs de validation si présentes -->
      <ul
        v-if="getAllErrors(representant.errors).length"
        class="fr-mt-1w errors-list"
      >
        <li
          v-for="(errMsg, index) in getAllErrors(representant.errors)"
          :key="index"
          class="fr-error-text"
        >
          {{ errMsg }}
        </li>
      </ul>
    </template>
  </div>

  <div class="fr-mt-2w">
    <DsfrLinkV2
      v-if="props.modifiable"
      as="button"
      class-names="fr-ml-0"
      @click="addNewRepresentant()"
    >
      + Ajouter un représentant légal
    </DsfrLinkV2>
  </div>
</template>

<script setup lang="ts">
import type { RepresentantUi, RepresentantLegalDto } from "@vao/shared-bridge";
import { ref } from "vue";
import * as yup from "yup";
import { requiredUnlessBrouillon } from "@/helpers/requiredUnlessBrouillon";
import { DsfrLinkV2 } from "@vao/shared-ui";
import { useOrganismeStore } from "@/stores/organisme";

const organismeStore = useOrganismeStore();

const props = defineProps<{
  modifiable?: boolean;
  statut?: string;
}>();

const representantSchema = yup.object({
  statut: yup.string(),
  prenom: requiredUnlessBrouillon(
    yup.string().required("Le prénom est requis"),
  ),
  nom: requiredUnlessBrouillon(yup.string().required("Le nom est requis")),
  fonction: requiredUnlessBrouillon(
    yup.string().required("La fonction est requise"),
  ),
});

function getAllErrors(errors: RepresentantUi["errors"]): string[] {
  return Object.entries(errors)
    .filter(([_, msg]) => !!msg)
    .map(([key, msg]) => {
      if (key.includes(".")) {
        const parts = key.split(".");
        return `${parts[1][0].toUpperCase() + parts[1].slice(1)}: ${msg}`;
      }
      return msg;
    });
}

function getEmptyRepresentant(): RepresentantUi {
  return {
    prenom: "",
    nom: "",
    fonction: "",
    statut: props.statut ?? "BROUILLON",
    errors: {
      prenom: "",
      nom: "",
      fonction: "",
    },
    isEditing: true,
    _backup: null,
  };
}

const representantsList = ref<RepresentantUi[]>([]);

function loadRepresentants(): void {
  const existants =
    organismeStore.organismeCourant?.personneMorale?.representantsLegaux || [];
  representantsList.value = existants.map((r: Partial<RepresentantUi>) => ({
    ...r,
    prenom: r.prenom || "",
    nom: r.nom || "",
    fonction: r.fonction || "",
    statut: props.statut ?? "BROUILLON",
    errors: {
      prenom: "",
      nom: "",
      fonction: "",
    },
    isEditing: false,
    _backup: null,
  }));
}

loadRepresentants();

function addNewRepresentant(): void {
  representantsList.value.push(getEmptyRepresentant());
}

function removeRepresentant(idx: number): void {
  representantsList.value.splice(idx, 1);
}

function editRepresentant(idx: number): void {
  const representant = representantsList.value[idx];
  representant._backup = { ...representant };
  representant.isEditing = true;
}

function cancelEditRepresentant(idx: number): void {
  const representant = representantsList.value[idx];
  if (representant._backup) {
    Object.assign(representant, representant._backup);
    representant.isEditing = false;
    representant._backup = null;
  } else {
    removeRepresentant(idx);
  }
}

async function saveRepresentant(idx: number): Promise<void> {
  const representant = representantsList.value[idx];
  Object.keys(representant.errors).forEach(
    (key) =>
      (representant.errors[key as keyof typeof representant.errors] = ""),
  );
  try {
    await representantSchema.validate(representant, { abortEarly: false });
    representant.isEditing = false;
    representant._backup = null;
  } catch (err) {
    if (err instanceof yup.ValidationError && err.inner) {
      err.inner.forEach((e) => {
        if (
          representant.errors[e.path as keyof typeof representant.errors] !==
          undefined
        ) {
          representant.errors[e.path as keyof typeof representant.errors] =
            e.message;
        }
      });
    }
  }
}

async function validateField(
  representant: RepresentantUi,
  field: keyof RepresentantUi["errors"],
): Promise<void> {
  try {
    await representantSchema.validateAt(field, representant);
    representant.errors[field] = "";
  } catch (err: unknown) {
    if (err instanceof yup.ValidationError) {
      representant.errors[field] = err.message;
    } else {
      representant.errors[field] = "Erreur de validation inconnue";
    }
  }
}

function getCleanRepresentants(): Array<RepresentantLegalDto> {
  return representantsList.value.map((r) => ({
    nom: r.nom,
    prenom: r.prenom,
    fonction: r.fonction,
  }));
}

async function validateAndSave(): Promise<false | RepresentantLegalDto[]> {
  let valid = true;

  for (const representant of representantsList.value) {
    Object.keys(representant.errors).forEach(
      (key) =>
        (representant.errors[key as keyof typeof representant.errors] = ""),
    );
    try {
      await representantSchema.validate(representant, { abortEarly: false });
    } catch (err: unknown) {
      valid = false;
      if (err instanceof yup.ValidationError && err.inner) {
        err.inner.forEach((e) => {
          if (
            representant.errors[e.path as keyof typeof representant.errors] !==
            undefined
          ) {
            representant.errors[e.path as keyof typeof representant.errors] =
              e.message;
          }
        });
      } else if (
        err instanceof yup.ValidationError &&
        err.path &&
        representant.errors[err.path as keyof typeof representant.errors] !==
          undefined
      ) {
        representant.errors[err.path as keyof typeof representant.errors] =
          err.message;
      }
    }
  }
  if (!valid) return false;
  return getCleanRepresentants();
}

defineExpose({
  getRepresentants: getCleanRepresentants,
  validateAndSave,
});
</script>

<style scoped>
.container-flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}
.container-flex-start {
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
}
.container-flex-end {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
.container-flex-column {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
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
.errors-list {
  list-style: none;
  padding-left: 0;
}
</style>
