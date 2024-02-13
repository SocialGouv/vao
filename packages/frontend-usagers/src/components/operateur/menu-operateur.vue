<template>
  <div>
    <DsfrSideMenu heading-title="">
      <DsfrSideMenuList
        id="menuLateral"
        :menu-items="sommaireOptionsToDisplay"
      />
    </DsfrSideMenu>
  </div>
</template>

<script setup>
const route = useRoute();
const props = defineProps({
  activeId: { type: Number, default: 1, required: false },
  operateur: { type: Object, default: null, required: true },
});
// const log = logger("pages/component/operateur/menu-operateur");
const isUpdate = computed(() => {
  return !!route.params.idOperateur;
});

const sommaireOptions = ref([
  {
    id: 1,
    text: "1. Renseignements généraux",
    to: isUpdate
      ? `/operateur/renseignements-generaux/${route.params.idOperateur}`
      : "/operateur/renseignements-generaux",
  },
  {
    id: 2,
    text: "2. Agrément",
    to: `/operateur/agrement/${route.params.idOperateur}`,
  },
  {
    id: 3,
    text: "3. Protocoles transport",
    to: `/operateur/protocole-transport/${route.params.idOperateur}`,
  },
  {
    id: 4,
    text: "4. Protocoles sanitaires",
    to: `/operateur/protocole-sanitaire/${route.params.idOperateur}`,
  },
  {
    id: 5,
    text: "5. Récapitulatif",
    to: `/operateur/recapitulatif/${route.params.idOperateur}`,
  },
]);

const sommaireOptionsToDisplay = computed(() => {
  if (props.operateur.length === 0) {
    return [
      {
        id: 1,
        text: "1. Renseignements généraux",
        to: "/operateur/renseignements-generaux",
        active: true,
      },
    ];
  } else {
    return sommaireOptions.value.map((s) => {
      return { ...s, active: s.id === props.activeId };
    });
  }
});
</script>

<style scoped></style>
