<template>
  <div class="fr-col-7">
    <dl>
      <template v-for="detail in currentEigValues" :key="detail.label">
        <dt>
          <strong>{{ detail.label }}: </strong>
        </dt>
        <dd>
          <a v-if="!!detail.href" :href="detail.href">{{ detail.value }}</a>
          <span v-else-if="typeof detail.value === 'string'">{{
            detail.value
          }}</span>
          <ul v-else-if="Array.isArray(detail.value)">
            <li v-for="item in detail.value" :key="item">{{ item }}</li>
          </ul>
        </dd>
      </template>
    </dl>
  </div>
</template>

<script setup>
import dayjs from "dayjs";
import { mapEigToLabel } from "../../utils/eigUtils";

const props = defineProps({
  eig: { type: Object, required: true },
  env: {
    type: String,
    required: true,
    validator: (value) => ["BO", "USAGER"].includes(value),
  },
});

const currentEigValues = computed(() => [
  {
    label: "Organisme",
    value: props.eig.raisonSociale ?? `${props.eig?.prenom} ${props.eig?.nom}`,
  },
  {
    label: "Déclaration",
    href: props.eig?.declarationId
      ? `/${props.env === "BO" ? "sejours" : "demande-sejour"}/${props.eig.declarationId}`
      : "",
    value: props.eig?.idFonctionnelle ?? "",
  },
  {
    label: "Nom du séjour",
    value: props.eig?.libelle ?? "",
  },
  {
    label: "Date du séjour",
    value:
      props.eig.dateDebut && props.eig.dateFin
        ? `${dayjs(props.eig.dateDebut).format("DD/MM/YYYY")} - ${dayjs(props.eig.dateFin).format("DD/MM/YYYY")}`
        : "",
  },
  {
    label: "Saison",
    value: props.eig?.saison ?? "",
  },
  {
    label: "Adresse du / des lieux de séjour",
    value: props.eig?.adresses ?? [],
  },
  {
    label: "Date de l'incident",
    value: props.eig?.date ? dayjs(props.eig?.date).format("DD/MM/YYYY") : "",
  },
  {
    label: "Département où a eu lieu l'incident",
    value: `${props.eig?.departement ?? ""} ${props.eig?.departementLibelle ? " - " + props.eig?.departementLibelle : ""}`,
  },
  {
    label: "type(s) d'événement(s)",
    value:
      props.eig?.types?.map(
        (t) => mapEigToLabel[t.type] + (t.precision ? " : " + t.precision : ""),
      ) ?? [],
  },
  {
    label: "Personnel présent lors de l'évènement",
    value: props.eig?.personnel?.map((p) => `${p.prenom} ${p.nom}`) ?? [],
  },
]);
</script>

<style scoped lang="scss">
dl {
  display: grid;
  grid-template-columns: 220px 1fr;
  row-gap: 0.5rem;
  column-gap: 1rem;
  margin: 0;
}
</style>
