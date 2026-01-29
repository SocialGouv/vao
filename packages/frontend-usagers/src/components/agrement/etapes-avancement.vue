<template>
  <div>
    <h3 class="fr-mb-0">Etapes d'avancement</h3>
    <p>A chaque étape vous recevez un e-mail sur {{ user.email }}</p>
    <div class="stepper-container">
      <div class="stepper">
        <div class="line"></div>
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
      </div>
      <ol class="cards">
        <li v-for="(step, idx) in steps" :key="step.statut">
          <AgrementEtapeAvancement
            :state="idx <= currentStepIndex ? 'success' : 'waiting'"
            :libelle="step.libelle"
            :entite="step.entite"
          >
            <template #temporalite>
              <template v-if="step.temporalite.texte">
                {{ step.temporalite.texte }}
                <a
                  v-if="step.temporalite.lien"
                  :href="step.temporalite.lien.url"
                  class="lien-info"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ step.temporalite.lien.label }}
                </a>
              </template>
              <template v-else>
                {{ step.temporalite }}
              </template>
            </template>
          </AgrementEtapeAvancement>
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AGREMENT_STATUT } from "@vao/shared-bridge";

const props = defineProps({
  initAgrement: { type: Object, required: true },
  territoire: { type: Object, required: true },
  user: { type: Object, required: true },
});

const statutOrder = [
  AGREMENT_STATUT.TRANSMIS,
  AGREMENT_STATUT.PRIS_EN_CHARGE,
  AGREMENT_STATUT.COMPLETUDE_CONFIRME,
  AGREMENT_STATUT.VALIDE,
];

const getEntite = () => {
  const prenom = props.territoire?.corresp_vao_prenom;
  const nom = props.territoire?.corresp_vao_nom;
  if (prenom && nom) {
    return prenom + " " + nom;
  }
  return "";
};

const steps = [
  {
    statut: AGREMENT_STATUT.TRANSMIS,
    libelle: "Envoi de la première demande d'agrément",
    temporalite: props.initAgrement?.dateDepot ?? "",
    entite: getEntite(),
  },
  {
    statut: AGREMENT_STATUT.PRIS_EN_CHARGE,
    libelle: "Vérification de la complétude de votre dossier",
    temporalite:
      "Possible demande de complément d'informations ou documents justificatifs",
    entite: getEntite(),
  },
  {
    statut: AGREMENT_STATUT.COMPLETUDE_CONFIRME,
    libelle: "Confirmation de complétude de votre dossier",
    temporalite: "Récépissé de complétude",
    entite: getEntite(),
  },
  {
    statut: AGREMENT_STATUT.VALIDE,
    libelle: "Décision d'obtention de l'agrément",
    temporalite: {
      texte: "Délais de deux mois à compter du récépissé de complétude",
      lien: {
        url: "https://example.com/info-delais",
        label: "Cliquer ici pour en savoir plus",
      },
    },
    entite: getEntite(),
  },
];

const currentStepIndex = computed(() =>
  statutOrder.indexOf(props.initAgrement?.statut),
);
</script>

<style scoped lang="scss">
li::marker {
  content: "";
}
.cards {
  list-style-type: none;
  display: flex;
  flex-flow: column nowrap;
  flex-grow: 1;
  gap: 8px;
  padding: 0;
  margin: 0;
}
.cards li {
  margin: 0;
  padding: 0;
}
.stepper-container {
  display: flex;
  flex-flow: row nowrap;
  gap: 1rem;
}
.stepper {
  flex-shrink: 0;
  position: relative;
}
.line {
  width: 4px;
  background: var(--light-decisions-artwork-artwork-major-blue-france, #000091);
  height: 100%;
}
.circle {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 16px;
  background: var(--light-decisions-artwork-artwork-major-blue-france, #000091);
  border-radius: 50%;
  margin: 16px 0;
}
.circle:nth-child(2) {
  top: 0px;
}
.circle:nth-child(3) {
  top: 94px;
}
.circle:nth-child(4) {
  top: 188px;
}
.circle:nth-child(5) {
  top: 274px;
  transform: translate(-50%, 0);
}

.lien-info {
  margin-left: 0.5rem;
  text-decoration: underline;
  color: var(--light-decisions-artwork-artwork-major-blue-france, #000091);

  &:hover {
    text-decoration: none;
  }
}

@media (max-width: 597px) {
  .circle:nth-child(2) {
    top: 0px;
  }
  .circle:nth-child(3) {
    top: 118px;
  }
  .circle:nth-child(4) {
    top: 236px;
  }
  .circle:nth-child(5) {
    top: 354px;
    transform: translate(-50%, 0);
  }
}
</style>
