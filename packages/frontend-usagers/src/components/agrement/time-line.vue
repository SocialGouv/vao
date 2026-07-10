<template>
  <section
    class="agrement-timeline fr-p-4w"
    aria-labelledby="agrement-timeline-titre"
  >
    <h3 id="agrement-timeline-titre" class="fr-h6 agrement-timeline__titre">
      Validité de l'agrément actuel ({{ titreDuree }})
    </h3>

    <!-- Équivalent texte complet pour les technologies d'assistance -->
    <p class="fr-sr-only">{{ texteAlternatif }}</p>

    <div class="agrement-timeline__frise" aria-hidden="true">
      <!-- Étiquette "jours restants", positionnée au-dessus du curseur -->
      <div
        class="agrement-timeline__badge-zone"
        :style="{ '--pos': cursorPercentLabel + '%' }"
      >
        <span v-if="!estExpire" class="agrement-timeline__badge">
          {{ joursRestants }} jour{{ joursRestants > 1 ? "s" : "" }} restant{{
            joursRestants > 1 ? "s" : ""
          }}
          ({{ moisRestants }} mois)
        </span>
        <span
          v-else
          class="agrement-timeline__badge agrement-timeline__badge--expire"
        >
          Expiré
        </span>
      </div>

      <!-- Piste de progression -->
      <div class="agrement-timeline__piste">
        <div class="agrement-timeline__fond"></div>
        <div
          class="agrement-timeline__remplissage"
          :style="{ width: progressPercent + '%' }"
        ></div>
        <span
          v-for="(g, i) in graduations"
          :key="i"
          class="agrement-timeline__graduation"
          :style="{ left: g + '%' }"
        ></span>
        <span
          class="agrement-timeline__curseur"
          :style="{ left: cursorPercent + '%' }"
        ></span>
      </div>
    </div>

    <!-- Dates : contenu réel, accessible, non masqué -->
    <dl class="agrement-timeline__dates">
      <div class="agrement-timeline__date agrement-timeline__date--debut">
        <dt class="fr-text--bold">Obtention</dt>
        <dd>{{ formatDate(dObtention) }}</dd>
      </div>
      <div
        class="agrement-timeline__date agrement-timeline__date--milieu"
        :style="{ '--pos': cursorPercentLabel + '%' }"
      >
        <dt class="fr-text--bold agrement-timeline__date-renouvellement">
          Début de période renouvellement
        </dt>
        <dd class="agrement-timeline__date-renouvellement">
          {{ formatDate(dDebutRenouvellement) }}
        </dd>
      </div>
      <div class="agrement-timeline__date agrement-timeline__date--fin">
        <dt class="fr-text--bold">Expiration</dt>
        <dd>{{ formatDate(dExpiration) }}</dd>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
/**
 * AgrementTimeline.vue
 * -----------------------------------------------------------------------
 * Frise de validité d'un agrément.
 *
 * - Conforme au Système de Design de l'État (DSFR) : utilise les
 *   variables CSS DSFR (couleurs, espacements) avec valeurs de repli si
 *   le CSS DSFR n'est pas chargé globalement.
 * - Conforme RGAA :
 *     - Toute l'information portée par la couleur/la position est
 *       doublée par du texte visible ou un texte masqué visuellement
 *       (classe fr-sr-only) destiné aux technologies d'assistance.
 *     - Les éléments purement décoratifs (barre, curseur, graduations)
 *       sont marqués aria-hidden="true".
 *     - Contraste des textes conforme AA (bleu France sur blanc,
 *       texte gris foncé DSFR par défaut).
 *     - Respecte prefers-reduced-motion (pas d'animation de la barre
 *       pour les utilisateurs qui la désactivent).
 * - La barre de progression bleue avance en fonction de la date du jour
 *   (entre dateObtention et dateExpiration).
 * - Le curseur rond est positionné à une date FIXE : n mois avant la
 *   date d'expiration (2 mois par défaut), indépendamment de la date
 *   du jour.
 */

import { computed } from "vue";

interface Props {
  /** Date d'obtention de l'agrément (extrémité gauche, fixe) */
  dateObtention: string | Date;
  /** Date d'expiration de l'agrément (extrémité droite, fixe) */
  dateExpiration: string | Date;
  /** Nombre de mois avant expiration marquant le début de la période
   *  de renouvellement (position du curseur rond). */
  moisAvantRenouvellement?: number;
  /** Libellé de durée affiché dans le titre, ex. "5 ans".
   *  Calculé automatiquement si non fourni. */
  dureeLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  moisAvantRenouvellement: 2,
  dureeLabel: undefined,
});

const MS_PAR_JOUR = 24 * 60 * 60 * 1000;

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

function ajouterMois(date: Date, mois: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + mois);
  return d;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

const formatDate = (value: string | Date): string =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(toDate(value));

const dObtention = computed(() => toDate(props.dateObtention));
const dExpiration = computed(() => toDate(props.dateExpiration));
const dAujourdhui = computed(() => new Date());

/** Date de début de la période de renouvellement : fixe, calculée une
 *  fois à partir de la date d'expiration, indépendante de "aujourd'hui". */
const dDebutRenouvellement = computed(() =>
  ajouterMois(dExpiration.value, -props.moisAvantRenouvellement),
);

const dureeTotaleMs = computed(
  () => dExpiration.value.getTime() - dObtention.value.getTime(),
);

/** Pourcentage de remplissage de la barre bleue : avance chaque jour. */
const progressPercent = computed(() => {
  if (dureeTotaleMs.value <= 0) return 0;
  const ecouleMs = dAujourdhui.value.getTime() - dObtention.value.getTime();
  return clamp((ecouleMs / dureeTotaleMs.value) * 100, 0, 100);
});

/** Position fixe du curseur rond (indépendante de la date du jour). */
const cursorPercent = computed(() => {
  if (dureeTotaleMs.value <= 0) return 0;
  const ms = dDebutRenouvellement.value.getTime() - dObtention.value.getTime();
  return clamp((ms / dureeTotaleMs.value) * 100, 0, 100);
});

/** Version bornée pour l'étiquette texte du curseur, afin qu'elle ne
 *  déborde jamais du cadre du composant. */
const cursorPercentLabel = computed(() => clamp(cursorPercent.value, 12, 88));

/** Jours restants avant expiration (0 si déjà expiré). */
const joursRestants = computed(() => {
  const diffMs = dExpiration.value.getTime() - dAujourdhui.value.getTime();
  return Math.max(0, Math.ceil(diffMs / MS_PAR_JOUR));
});

const moisRestants = computed(() => Math.round(joursRestants.value / 30.44));

const estExpire = computed(
  () => dAujourdhui.value.getTime() > dExpiration.value.getTime(),
);

const dureeAnsCalculee = computed(() => {
  const ans = dureeTotaleMs.value / (365.25 * MS_PAR_JOUR);
  return Math.round(ans);
});

const titreDuree = computed(
  () =>
    props.dureeLabel ??
    `${dureeAnsCalculee.value} an${dureeAnsCalculee.value > 1 ? "s" : ""}`,
);

/** Graduations décoratives réparties le long de la barre. */
const graduations = [0, 16.5, 33, 50, 66.5, 83, 100];

const texteAlternatif = computed(() => {
  if (estExpire.value) {
    return `Période de validité du ${formatDate(dObtention.value)} au ${formatDate(
      dExpiration.value,
    )}. Cet agrément est arrivé à expiration.`;
  }
  return `Période de validité du ${formatDate(dObtention.value)} au ${formatDate(
    dExpiration.value,
  )}. Progression actuelle : ${Math.round(progressPercent.value)} pourcent. Il reste ${
    joursRestants.value
  } jour${joursRestants.value > 1 ? "s" : ""}, soit environ ${moisRestants.value} mois, avant expiration. La période de renouvellement débute le ${formatDate(
    dDebutRenouvellement.value,
  )}.`;
});
</script>


<style scoped>
.agrement-timeline {
  --at-bleu: var(--background-action-high-blue-france, #000091);
  --at-bleu-clair: var(--background-alt-blue-france, #f5f5fe);
  --at-piste: var(--background-contrast-grey, #e5e5e5);
  --at-texte: var(--text-title-grey, #1e1e1e);
  --at-texte-attenue: var(--text-mention-grey, #666666);
  --at-radius: 0.25rem;

  background-color: var(--at-bleu-clair);
  border-radius: var(--at-radius);
  font-family: Marianne, arial, sans-serif;
  color: var(--at-texte);
}

.agrement-timeline__titre {
  margin: 0 0 2.5rem 0;
  color: var(--at-texte);
}

/* --- Zone de frise --- */
.agrement-timeline__frise {
  position: relative;
  padding-top: 1.75rem;
}

.agrement-timeline__badge-zone {
  position: absolute;
  top: 0;
  left: var(--pos, 50%);
  transform: translateX(-50%);
  white-space: nowrap;
}

.agrement-timeline__badge {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--at-bleu);
}

.agrement-timeline__badge--expire {
  color: var(--text-default-error, #ce0500);
}

.agrement-timeline__piste {
  position: relative;
  height: 0.5rem;
}

.agrement-timeline__fond,
.agrement-timeline__remplissage {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 999px;
}

.agrement-timeline__fond {
  width: 100%;
  background-color: var(--at-piste);
}

.agrement-timeline__remplissage {
  background-color: var(--at-bleu);
  transition: width 0.4s ease;
}

@media (prefers-reduced-motion: reduce) {
  .agrement-timeline__remplissage {
    transition: none;
  }
}

.agrement-timeline__graduation {
  position: absolute;
  top: 50%;
  width: 0.25rem;
  height: 0.25rem;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  transform: translate(-50%, -50%);
  z-index: 1;
}

.agrement-timeline__curseur {
  position: absolute;
  top: 50%;
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 50%;
  background-color: #ffffff;
  border: 3px solid var(--at-bleu);
  box-shadow: 0 0 0 2px #ffffff;
  transform: translate(-50%, -50%);
  z-index: 2;
}

/* --- Dates --- */
.agrement-timeline__dates {
  position: relative;
  display: flex;
  justify-content: space-between;
  margin: 1.5rem 0 0 0;
  min-height: 3.5rem;
}

.agrement-timeline__date {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.agrement-timeline__date dt {
  font-size: 0.875rem;
}

.agrement-timeline__date dd {
  margin: 0;
  font-size: 0.875rem;
  color: var(--at-texte-attenue);
}

.agrement-timeline__date--debut {
  align-items: flex-start;
  text-align: left;
}

.agrement-timeline__date--fin {
  align-items: flex-end;
  text-align: right;
}

.agrement-timeline__date--milieu {
  position: absolute;
  top: 0;
  left: var(--pos, 50%);
  transform: translateX(-50%);
  align-items: center;
  text-align: center;
}

.agrement-timeline__date-renouvellement {
  color: var(--at-bleu);
}

.agrement-timeline__date--milieu dd.agrement-timeline__date-renouvellement {
  color: var(--at-bleu);
}

/* --- Petits écrans : on repasse les 3 dates en colonne --- */
@media (max-width: 36rem) {
  .agrement-timeline__dates {
    flex-direction: column;
    gap: 1rem;
    min-height: 0;
  }

  .agrement-timeline__date--milieu {
    position: static;
    transform: none;
    align-items: flex-start;
    text-align: left;
  }

  .agrement-timeline__date--fin {
    align-items: flex-start;
    text-align: left;
  }
}
</style>
