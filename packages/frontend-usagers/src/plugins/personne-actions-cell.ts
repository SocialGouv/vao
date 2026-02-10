import { defineNuxtPlugin } from '#app'
import PersonneActionsCell from '~/components/PersonneActionsCell.vue';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('PersonneActionsCell', PersonneActionsCell)
})