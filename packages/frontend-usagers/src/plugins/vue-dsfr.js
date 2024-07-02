import {
  RiQuestionLine,
  RiEditBoxLine,
  RiLogoutBoxLine,
  RiEyeLine,
  RiEyeCloseLine,
  RiDeleteBin2Line,
  RiFileCopy2Fill,
  RiCloseLine,
} from "oh-vue-icons/icons";

import VueDsfr from "@gouvminint/vue-dsfr";
import { defineNuxtPlugin } from "#app";

const icons = [
  RiLogoutBoxLine,
  RiEditBoxLine,
  RiEyeLine,
  RiEyeCloseLine,
  RiDeleteBin2Line,
  RiQuestionLine,
  RiFileCopy2Fill,
  RiCloseLine,
];
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueDsfr, { icons });
});
