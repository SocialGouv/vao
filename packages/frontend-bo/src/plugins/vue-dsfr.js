import {
  RiEditBoxLine,
  RiLogoutBoxLine,
  RiDeleteBin2Line,
} from "oh-vue-icons/icons";

import VueDsfr from "@gouvminint/vue-dsfr";
import { defineNuxtPlugin } from "#app";

const icons = [RiLogoutBoxLine, RiEditBoxLine, RiDeleteBin2Line];
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueDsfr, { icons });
});
