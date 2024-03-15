import {
  RiEditBoxLine,
  RiLogoutBoxLine,
  RiEyeLine,
  RiEyeCloseLine,
  RiDeleteBin2Line,
} from "oh-vue-icons/icons";

import VueDsfr from "@gouvminint/vue-dsfr";
import { defineNuxtPlugin } from "#app";

const icons = [
  RiLogoutBoxLine,
  RiEditBoxLine,
  RiEyeLine,
  RiEyeCloseLine,
  RiDeleteBin2Line,
];
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueDsfr, { icons });
});
