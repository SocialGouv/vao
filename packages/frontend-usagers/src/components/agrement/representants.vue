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
          <DsfrButton secondary @click="removeRepresentant(idx)">
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

<script setup>
import { ref } from "vue";
import * as yup from "yup";
import { requiredUnlessBrouillon } from "@/helpers/requiredUnlessBrouillon";
import { DsfrLinkV2 } from "@vao/shared-ui";
import SearchAddress from "@/components/address/search-address.vue";
import { useOrganismeStore } from "@/stores/organisme";
import { telephoneYup } from "@/utils/telephoneValidators";

const organismeStore = useOrganismeStore();

const props = defineProps({
  modifiable: { type: Boolean, default: true },
  statut: { type: String, default: "BROUILLON" },
});

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
      .typeError("L'adresse est requise") // <-- Ajouté pour forcer l'erreur si non objet ou vide
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

function getAllErrors(errors) {
  // Affiche toutes les erreurs, y compris celles imbriquées (ex: adresseDomicile.label)
  return Object.entries(errors)
    .filter(([_, msg]) => !!msg)
    .map(([key, msg]) => {
      // Si le champ est imbriqué, on peut afficher le nom du champ
      if (key.includes(".")) {
        const parts = key.split(".");
        return `${parts[1][0].toUpperCase() + parts[1].slice(1)}: ${msg}`;
      }
      return msg;
    });
}

function getEmptyRepresentant() {
  return {
    prenom: "",
    nom: "",
    telephoneRepresentant: "",
    emailRepresentant: "",
    adresseDomicile: undefined,
    statut: props.statut,
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

const representantsList = ref([]);

function loadRepresentants() {
  const existants =
    organismeStore.organismeCourant?.personneMorale?.representantsLegaux || [];
  representantsList.value = existants.map((r) => ({
    ...r,
    adresseDomicile: r.adresseDomicile || undefined,
    statut: props.statut,
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

function onAdresseSelect(representant, selected) {
  representant.adresseDomicile = {
    label: selected.label || "",
    code_insee: selected.codeInsee || "",
    code_postal: selected.codePostal || "",
    long: selected.coordinates ? String(selected.coordinates[0]) : "",
    lat: selected.coordinates ? String(selected.coordinates[1]) : "",
    departement: selected.departement || "",
  };
}

function addNewRepresentant() {
  representantsList.value.push(getEmptyRepresentant());
}

function removeRepresentant(idx) {
  representantsList.value.splice(idx, 1);
}

function editRepresentant(idx) {
  const representant = representantsList.value[idx];
  representant._backup = { ...representant };
  representant.isEditing = true;
}

function cancelEditRepresentant(idx) {
  const representant = representantsList.value[idx];
  if (representant._backup) {
    Object.assign(representant, representant._backup);
    representant.isEditing = false;
    representant._backup = null;
  } else {
    removeRepresentant(idx);
  }
}

async function saveRepresentant(idx) {
  const representant = representantsList.value[idx];
  Object.keys(representant.errors).forEach(
    (key) => (representant.errors[key] = ""),
  );
  try {
    await representantSchema.validate(representant, { abortEarly: false });
    representant.isEditing = false;
    representant._backup = null;
  } catch (err) {
    if (err.inner) {
      err.inner.forEach((e) => {
        if (representant.errors[e.path] !== undefined) {
          representant.errors[e.path] = e.message;
        }
      });
    }
  }
}

async function validateField(representant, field) {
  try {
    await representantSchema.validateAt(field, representant);
    representant.errors[field] = "";
  } catch (err) {
    representant.errors[field] = err.message;
  }
}

async function validateAndSave() {
  let valid = true;
  for (const representant of representantsList.value) {
    // Réinitialise les erreurs
    Object.keys(representant.errors).forEach(
      (key) => (representant.errors[key] = ""),
    );
    try {
      await representantSchema.validate(representant, { abortEarly: false });
    } catch (err) {
      valid = false;
      // Attache chaque erreur à son champ
      if (err.inner) {
        err.inner.forEach((e) => {
          if (representant.errors[e.path] !== undefined) {
            console.error(`Validation error for field ${e.path}:`, e);
            representant.errors[e.path] = e.message;
          }
        });
      } else if (err.path && representant.errors[err.path] !== undefined) {
        representant.errors[err.path] = err.message;
      }
    }
  }
  if (!valid) return false;
  return representantsList.value.map(({ ...r }) => r);
}

defineExpose({
  getRepresentants: () => representantsList.value.map(({ ...r }) => r),
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
