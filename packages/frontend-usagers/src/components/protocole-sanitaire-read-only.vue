<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label"
            >Dispositions sanitaires spécifiques</span
          >
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.dispositionsSpecifiques ? " Oui" : "Non"
          }}</span>
        </div>
      </div>
      <div
        v-if="props.initData.dispositionsSpecifiques"
        class="fr-fieldset__element"
      >
        <div class="fr-col-12">
          <span class="read-only-label">Précision</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.precisionDispositionsSpecifiques
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Constitution de l'équipe</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            constitutionEquipeOptions
              .filter((f) => {
                return props.initData.constitutionEquipe.includes(f.name);
              })
              .map((i) => i.label)
              .join()
          }}</span>
        </div>
      </div>
      <div
        v-if="props.initData.constitutionEquipe.length > 0"
        class="fr-fieldset__element"
      >
        <div class="fr-col-12">
          <span class="read-only-label">Précision</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.precisionConstitutionEquipe
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label"
            >Trousse à pharmacie de premier secours</span
          >
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.troussePharmacie ? " Oui" : "Non"
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label"
            >Personne en charge des médicaments
          </span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            responsableAdministrationMedicamentOptions
              .filter((f) => {
                return props.initData.responsableAdministrationMedicament.includes(
                  f.name,
                );
              })
              .map((i) => i.label)
              .join()
          }}</span>
        </div>
      </div>
      <div
        v-if="props.initData.responsableAdministrationMedicament.length > 0"
        class="fr-fieldset__element"
      >
        <div class="fr-col-12">
          <span class="read-only-label">Précision</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.precisionResponsableAdministrationMedicament
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label"
            >Stockage des médicaments dans un lieu sécurisé</span
          >
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.stockageMedicamentSecurise ? " Oui" : "Non"
          }}</span>
        </div>
      </div>
      <div
        v-if="props.initData.stockageMedicamentSecurise"
        class="fr-fieldset__element"
      >
        <div class="fr-col-12">
          <span class="read-only-label">Précision</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.precisionStockageMedicamentSecurise
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label"
            >Dispositif de conservation des médicaments thermosensibles</span
          >
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.conservationMedicamentThermosensible ? " Oui" : "Non"
          }}</span>
        </div>
      </div>
      <div
        v-if="props.initData.conservationMedicamentThermosensible"
        class="fr-fieldset__element"
      >
        <div class="fr-col-12">
          <span class="read-only-label">Précision</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.precisionConservationMedicamentThermosensible
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Individualisation des médicaments</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.individualisationMedicaments ? " Oui" : "Non"
          }}</span>
        </div>
      </div>
      <div
        v-if="props.initData.individualisationMedicaments"
        class="fr-fieldset__element"
      >
        <div class="fr-col-12">
          <span class="read-only-label">Précision</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.precisionIndividualisationMedicaments
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label"
            >Méthode de préparation des piluliers</span
          >
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            preparationPilluliersOptions
              .filter((f) => {
                return props.initData.preparationPilluliers === f.name;
              })
              .map((i) => i.label)
              .join()
          }}</span>
        </div>
      </div>
      <div
        v-if="
          props.initData.preparationPilluliers === 'prepares_prealablement' ||
          props.initData.preparationPilluliers === 'au_fur_et_a_mesure'
        "
        class="fr-fieldset__element"
      >
        <div class="fr-col-12">
          <span class="read-only-label">Précision</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.precisionPreparationPilluliers
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Prescription médicale jointe </span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.prescriptionMedicaleJointe ? " Oui" : "Non"
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label"
            >Protocole de modification de traitement
          </span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.protocoleModificationTraitement ? " Oui" : "Non"
          }}</span>
        </div>
      </div>
      <div
        v-if="props.initData.protocoleModificationTraitement"
        class="fr-fieldset__element"
      >
        <div class="fr-col-12">
          <span class="read-only-label">Précision</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.precisionProtocoleModificationTraitement
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Fiche de suivi des médicaments</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.ficheSuiviMedicaments ? " Oui" : "Non"
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label"
            >Protocole d’évacuation et de rapatriement
          </span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.protocoleEvacuation ? " Oui" : "Non"
          }}</span>
        </div>
      </div>
      <div
        v-if="props.initData.protocoleEvacuation"
        class="fr-fieldset__element"
      >
        <div class="fr-col-12">
          <span class="read-only-label">Précision</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.precisionProtocoleEvacuation
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Protocole en cas d'accident </span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.protocoleAccident ? " Oui" : "Non"
          }}</span>
        </div>
      </div>
      <div v-if="props.initData.protocoleAccident" class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Précision</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.precisionProtocoleAccident
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label"
            >Protocole de réorientation des vacanciers</span
          >
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.protocoleReorientation ? " Oui" : "Non"
          }}</span>
        </div>
      </div>
      <div
        v-if="props.initData.protocoleReorientation"
        class="fr-fieldset__element"
      >
        <div class="fr-col-12">
          <span class="read-only-label">Précision</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.precisionProtocoleReorientation
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Protocole canicule</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.protocoleCanicule ? " Oui" : "Non"
          }}</span>
        </div>
      </div>
      <div v-if="props.initData.protocoleCanicule" class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Précision</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.precisionProtocoleCanicule
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label"
            >Conditions de gestion du budget personnel des vacanciers</span
          >
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.gestionBudgetPersonnel
          }}</span>
        </div>
      </div>
    </fieldset>
  </div>
</template>

<script setup>
const props = defineProps({
  initData: { type: Object, default: null, required: true },
});

const log = logger("components/protocole-sanitaire-read-only");

const constitutionEquipeOptions = [
  {
    label:
      "Une personne formée aux gestes et soins d’urgence (PSC 1, SST, AFGSU 1, AFGSU 2, AFSGSU)",
    id: "personne_formee",
    name: "personne_formee",
  },
  {
    label: "Un(e) infirmier(e)",
    id: "infirmier",
    name: "infirmier",
  },
  {
    label: "Un(e) aide soignant(e)",
    id: "aide_soignant",
    name: "aide_soignant",
  },
];

const responsableAdministrationMedicamentOptions = [
  {
    label: "Responsable du séjour",
    id: "responsable_sejour",
    name: "responsable_sejour",
  },
  {
    label: "Accompagnant(s)",
    id: "accompagnant",
    name: "accompagnant",
  },
  {
    label: "Professionnel de santé",
    id: "professionnel_sante",
    name: "professionnel_sante",
  },
];

const preparationPilluliersOptions = [
  { label: "Aucune méthode", id: "aucune", value: "aucune" },
  {
    label:
      "Piluliers préparés préalablement au séjour par le vacancier, sa famille, le représentant légal, l’établissement de résidence habituelle, le médecin",
    id: "prepares_prealablement",
    value: "prepares_prealablement",
  },
  {
    label: "Piluliers préparés durant le séjour",
    id: "au_fur_et_a_mesure",
    value: "au_fur_et_a_mesure",
  },
];
</script>

<style lang="scss" scoped></style>
