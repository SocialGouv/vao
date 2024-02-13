import { defineStore } from "pinia";

export const useLayoutStore = defineStore("layout", {
  state: () => ({
    breadCrumb: ref(),
    stepperIndex: ref(),
    displaySideMenu: ref(true),
  }),
});
