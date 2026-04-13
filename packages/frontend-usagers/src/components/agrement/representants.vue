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
            <!-- Boutons d'édition d'un existant -->
            <div
              v-if="representant.isEditing && representant._backup"
              class="container-flex-column"
            >
              <DsfrLinkV2
                as="button"
                icon-name="icon-save-line"
                @click="saveRepresentant(idx)"
              >
                Enregistrer les modifications
              </DsfrLinkV2>
              <DsfrLinkV2
                as="button"
                icon-name="icon-close-line"
                @click="cancelEditRepresentant(idx)"
              >
                Annuler les modifications
              </DsfrLinkV2>
            </div>
            <DsfrLinkV2
              v-if="!representant.isEditing"
              as="button"
              icon-name="icon-edit-line"
              @click="editRepresentant(idx)"
            >
              Modifier
            </DsfrLinkV2>
          </template>
          <DsfrButton
            v-if="props.modifiable"
            secondary
            @click="removeRepresentant(idx)"
          >
            Supprimer ce représentant
          </DsfrButton>
        </div>
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
          name="telephoneRepresentant"
          label="Téléphone"
          :label-visible="true"
          :model-value="representant.telephoneRepresentant"
          :is-valid="!representant.errors.telephoneRepresentant"
          :error-message="representant.errors.telephoneRepresentant"
          :disabled="!props.modifiable"
          hint="Au format 0X, +33X ou 0033. Exemple : 0612345678"
          @update:model-value="
            (val) => {
              representant.telephoneRepresentant = val;
              validateField(representant, 'telephoneRepresentant');
            }
          "
        />
        <DsfrInputGroup
          name="emailRepresentant"
          label="Email"
          :label-visible="true"
          :model-value="representant.emailRepresentant"
          :is-valid="!representant.errors.emailRepresentant"
          :error-message="representant.errors.emailRepresentant"
          :disabled="!props.modifiable"
          hint="Adresse courriel de la personne. Exemple: nom@domaine.fr"
          @update:model-value="
            (val) => {
              representant.emailRepresentant = val;
              validateField(representant, 'emailRepresentant');
            }
          "
        />
        <SearchAddress
          label="Adresse du domicile"
          :model-value="representant.adresseDomicile"
          :error-message="representant.errors.adresseDomicile"
          :disabled="!props.modifiable"
          @select="
            (selected) => {
              onAdresseSelect(representant, selected);
              validateField(representant, 'adresseDomicile');
            }
          "
        />
      </form>
      <!-- Boutons d'ajout d'un nouveau représentant -->
      <div
        v-if="props.modifiable && !representant._backup"
        class="container-flex-start"
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
        <dt><strong>Téléphone:</strong></dt>
        <dd>{{ representant.telephoneRepresentant || "-" }}</dd>
        <dt><strong>Email:</strong></dt>
        <dd>{{ representant.emailRepresentant || "-" }}</dd>
        <dt><strong>Adresse du domicile:</strong></dt>
        <dd>
          {{
            representant.adresseDomicile && representant.adresseDomicile.label
              ? representant.adresseDomicile.label
              : representant.adresseDomicile
                ? representant.adresseDomicile
                : "-"
          }}
        </dd>
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
import type { Representant } from "@vao/shared-bridge/src/dto/personneMorale.dto";
import { ref } from "vue";
import * as yup from "yup";
import { requiredUnlessBrouillon } from "@/helpers/requiredUnlessBrouillon";
import { DsfrLinkV2 } from "@vao/shared-ui";
import SearchAddress from "@/components/address/search-address.vue";
import { useOrganismeStore } from "@/stores/organisme";
import { telephoneYup } from "@/utils/telephoneValidators";
import type { AdresseDto } from "@vao/shared-bridge/src/dto/adresse.dto";

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
  telephoneRepresentant: requiredUnlessBrouillon(telephoneYup()),
  emailRepresentant: requiredUnlessBrouillon(
    yup
      .string()
      .required("L'email est requis")
      .email("Format d'email invalide"),
  ),
  adresseDomicile: requiredUnlessBrouillon(
    yup
      .object({
        label: yup.string().required("L'adresse est requise"),
      })
      .typeError("L'adresse est requise")
      .required("L'adresse est requise")
      .test(
        "adresse-not-empty",
        "L'adresse est requise",
        (value) =>
          !!(
            value &&
            typeof value === "object" &&
            value.label &&
            value.label.trim() !== ""
          ),
      ),
  ),
});

function getAllErrors(errors: Representant["errors"]): string[] {
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

function getEmptyRepresentant(): Representant {
  return {
    prenom: "",
    nom: "",
    fonction: "",
    telephoneRepresentant: "",
    emailRepresentant: "",
    adresseDomicile: undefined,
    statut: props.statut ?? "BROUILLON",
    errors: {
      prenom: "",
      nom: "",
      telephoneRepresentant: "",
      emailRepresentant: "",
      adresseDomicile: "",
    },
    isEditing: true,
    _backup: null,
  };
}

const representantsList = ref<Representant[]>([]);

function loadRepresentants(): void {
  const existants =
    organismeStore.organismeCourant?.personneMorale?.representantsLegaux || [];
  representantsList.value = existants.map((r: Partial<Representant>) => ({
    ...r,
    prenom: r.prenom || "",
    nom: r.nom || "",
    fonction: r.fonction || "",
    telephoneRepresentant: r.telephoneRepresentant || "",
    emailRepresentant: r.emailRepresentant || "",
    adresseDomicile: r.adresseDomicile || undefined,
    statut: props.statut ?? "BROUILLON",
    errors: {
      prenom: "",
      nom: "",
      telephoneRepresentant: "",
      emailRepresentant: "",
      adresseDomicile: "",
    },
    isEditing: false,
    _backup: null,
  }));
}

loadRepresentants();

function onAdresseSelect(
  representant: Representant,
  selected: AdresseDto,
): void {
  representant.adresseDomicile = {
    label: selected.label || "",
    codeInsee: selected.codeInsee || "",
    codePostal: selected.codePostal || "",
    long: selected.coordinates ? String(selected.coordinates[0]) : "",
    lat: selected.coordinates ? String(selected.coordinates[1]) : "",
    departement: selected.departement || "",
    coordinates: selected.coordinates || null,
  };
}

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
  representant: Representant,
  field: keyof Representant["errors"],
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

async function validateAndSave(): Promise<false | Representant[]> {
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
  return representantsList.value.map(({ ...r }) => r);
}

defineExpose({
  getRepresentants: (): Representant[] =>
    representantsList.value.map(({ ...r }) => r),
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
