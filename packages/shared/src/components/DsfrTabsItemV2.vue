<script lang="ts" setup>
import { ref } from "vue";

export type DsfrTabItemProps = {
  panelId: string;
  selected: boolean;
  tabId: string;
  label?: string;
  icon?: string;
};
const props = withDefaults(defineProps<DsfrTabItemProps>(), {
  label: "",
  icon: undefined,
});

const emit = defineEmits<{
  click: [tabId: string];
  next: [];
  previous: [];
  first: [];
  last: [];
}>();

const button = ref<HTMLButtonElement | null>(null);

const keyToEventDict = {
  ArrowRight: "next",
  ArrowLeft: "previous",
  ArrowDown: "next",
  ArrowUp: "previous",
  Home: "first",
  End: "last",
} as const;

function onKeyDown(event: KeyboardEvent) {
  const key = event?.key as keyof typeof keyToEventDict;
  const eventToEmit = keyToEventDict[key];
  if (eventToEmit) {
    // @ts-expect-error 2769
    emit(eventToEmit);
  }
}
</script>

<template>
  <li role="presentation">
    <button
      :id="props.tabId"
      ref="button"
      :data-testid="`test-${props.tabId}`"
      class="fr-tabs__tab"
      :tabindex="props.selected ? 0 : -1"
      role="tab"
      type="button"
      :aria-selected="props.selected"
      :aria-controls="props.panelId"
      @click.prevent="$emit('click', props.tabId)"
      @keydown="onKeyDown($event)"
    >
      <!-- @slot Slot par défaut pour le contenu de l’onglet. Sera dans `<button class="fr-tabs__tab">` -->
      <slot>{{ props.label }}</slot>
    </button>
  </li>
</template>
