import { defineStore } from "pinia";
import { ref } from "#imports";

export const useLayoutStore = defineStore("layout", {
  state: () => ({
    breadCrumb: ref(),
    stepperIndex: ref(),
    displaySideMenu: ref(true),
  }),
});
