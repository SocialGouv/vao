import {
  RiEditBoxLine,
  RiLogoutBoxLine,
  RiDeleteBin2Line,
  RiFeedbackLine,
} from "oh-vue-icons/icons";

import VueDsfr from "@gouvminint/vue-dsfr";
import { defineNuxtPlugin } from "#app";

const icons = [
  RiLogoutBoxLine,
  RiEditBoxLine,
  RiDeleteBin2Line,
  RiFeedbackLine,
];
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueDsfr, { icons });
});
