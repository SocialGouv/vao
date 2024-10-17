<script lang="ts" setup generic="T extends Object">
import { useId, ref, computed, nextTick, onUnmounted } from "vue";
import type { VNode } from "vue";
import { usePopper } from "../composables/usePopper.ts";
import CollapseTransition from "../transitions/CollapseTransition.vue";

const isObjectWithIdKey = (
  option: unknown,
  idKey: keyof T | undefined,
): option is T => {
  return (
    typeof option === "object" && option !== null && !!idKey && idKey in option
  );
};

const getValueOrId = (
  option: T | string | number,
  idKey: keyof T | undefined,
): string | number => {
  if (idKey && isObjectWithIdKey(option, idKey)) {
    const value = option[idKey];
    if (typeof value === "string" || typeof value === "number") {
      return value;
    }
    throw new Error(
      `The value of idKey ${String(idKey)} is not a string or number.`,
    );
  }

  if (typeof option === "string" || typeof option === "number") {
    return option;
  }

  throw new Error(
    "Option is not a valid string, number, or object with idKey.",
  );
};

const getFocusableElements = (): HTMLElement[] => {
  return Array.from(
    document.querySelectorAll<HTMLElement>(
      'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => !el.hasAttribute("disabled"));
};

const generateId = (
  option: T | string | number,
  id: string,
  idKey: keyof T | undefined,
): string => {
  return `${id}-${getValueOrId(option, idKey)}`;
};

const props = withDefaults(
  defineProps<{
    modelValue: (string | number)[];
    options: (T | string | number)[];
    label?: string;
    name?: string;
    description?: string;
    legend?: string;
    buttonLabel?: string;
    selectId?: string;
    disabled?: boolean;
    required?: boolean;
    selectAll?: boolean;
    search?: boolean;
    selectAllLabel?: [string, string];
    idKey?: keyof {
      [K in keyof T as T[K] extends string | number ? K : never]: T[K];
    };
    labelKey?: keyof {
      [K in keyof T as T[K] extends string | number ? K : never]: T[K];
    };
    filteringKeys?: (keyof T)[];
    maxOverflowHeight?: CSSStyleDeclaration["maxHeight"];
  }>(),
  {
    label: "",
    name: "",
    description: "",
    legend: "",
    selectId: "",
    buttonLabel: "",
    selectAll: false,
    selectAllLabel: () => ["Tout sélectionner", "Tout désélectionner"],
    search: false,
    idKey: "id" as keyof {
      [K in keyof T as T[K] extends string | number ? K : never]: T[K];
    },
    labelKey: "label" as keyof {
      [K in keyof T as T[K] extends string | number ? K : never]: T[K];
    },
    filteringKeys: () => ["label"] as (keyof T)[],
    maxOverflowHeight: "400px",
  },
);

const id = props.selectId || useId() || "dsfr-multi-select";

const host = ref<HTMLButtonElement | null>(null);
const popover = ref<null | HTMLElement>(null);
const searchElement = ref<null | HTMLElement>(null);
const selectAllElement = ref<null | HTMLElement>(null);
const model = defineModel<(string | number)[]>({ required: true });

type SlotProps<T> = {
  label: () => VNode;
  "required-tip": () => VNode;
  description: () => VNode;
  "button-label": () => VNode;
  legend: () => VNode;
  "checkbox-label": (props: { option: T | string | number }) => VNode;
  "no-results": () => VNode;
};

defineSlots<SlotProps<T>>();

const { hostSize, popoverPosition, activeTracking } = usePopper(host);

const getAllCheckbox = (): NodeListOf<HTMLElement> =>
  document.querySelectorAll(`[id^="${id}-"][id$="-checkbox"]`);

const isVisible = ref(false);
const searchInput = ref("");

const handleClickOutside = (event: MouseEvent) => {
  const element = event.target as HTMLElement;
  if (!host.value?.contains(element) && !popover.value?.contains(element)) {
    isVisible.value = false;
    activeTracking.value = false;
    document.removeEventListener("click", handleClickOutside);
    document.removeEventListener("keydown", handleKeyDownEscape);
  }
};

const handleKeyDownEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    document.removeEventListener("click", handleClickOutside);
    document.removeEventListener("keydown", handleKeyDownEscape);
    isVisible.value = false;
    activeTracking.value = false;
    if (host.value) {
      host.value.focus();
    }
  }
};

const handleClick = async () => {
  activeTracking.value = !isVisible.value;
  isVisible.value = !isVisible.value;
  if (isVisible.value) {
    await nextTick();
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleKeyDownEscape);
    if (popover.value) {
      if (selectAllElement.value) {
        selectAllElement.value.focus();
      } else if (searchElement.value) {
        searchElement.value.focus();
      } else {
        const [firstCheckbox] = getAllCheckbox();
        if (firstCheckbox) {
          firstCheckbox.focus();
        }
      }
    }
  } else {
    document.removeEventListener("click", handleClickOutside);
    document.removeEventListener("keydown", handleKeyDownEscape);
  }
};

const filterdOptions = computed(() =>
  props.options.filter((option) => {
    if (typeof option === "object" && option !== null) {
      return props.filteringKeys.some((key) =>
        `${option[key]}`
          .toLowerCase()
          .includes(searchInput.value.toLowerCase()),
      );
    }
    return `${option}`.toLowerCase().includes(searchInput.value.toLowerCase());
  }),
);

const isAllSelected = computed(() => {
  if (props.modelValue.length < filterdOptions.value.length) {
    return false;
  }

  return filterdOptions.value.every((option) => {
    const value = getValueOrId(option, props.idKey);
    return props.modelValue.includes(value as never);
  });
});

const handleClickSelectAllClick = () => {
  const modelSet = new Set<string | number>(model.value || []);

  if (isAllSelected.value) {
    filterdOptions.value.forEach((option) => {
      const value = getValueOrId(option, props.idKey);
      modelSet.delete(value as never);
    });
  } else {
    filterdOptions.value.forEach((option) => {
      const value = getValueOrId(option, props.idKey);
      modelSet.add(value as never);
    });
  }

  model.value = Array.from(modelSet);
};

const handleFocusFirstCheckbox = (event: KeyboardEvent) => {
  const [firstCheckbox] = getAllCheckbox();
  if (firstCheckbox) {
    event.preventDefault();
    firstCheckbox.focus();
  }
};

const handleFocusNextCheckbox = (event: KeyboardEvent) => {
  event.preventDefault();
  const checkboxes = getAllCheckbox();
  const activeElement = document.activeElement as HTMLElement;
  const currentIndex = Array.from(checkboxes).indexOf(activeElement);

  if (currentIndex !== -1) {
    const nextIndex = (currentIndex + 1) % checkboxes.length;
    checkboxes[nextIndex].focus();
  }
};

const handleFocusPreviousCheckbox = (event: KeyboardEvent) => {
  event.preventDefault();
  const checkboxes = getAllCheckbox();
  const activeElement = document.activeElement as HTMLElement;
  const currentIndex = Array.from(checkboxes).indexOf(activeElement);

  if (currentIndex !== -1) {
    const previousIndex =
      (currentIndex - 1 + checkboxes.length) % checkboxes.length;
    checkboxes[previousIndex].focus();
  }
};

const handleFocusNextElementUsingTab = (event: KeyboardEvent) => {
  const checkboxes = getAllCheckbox();
  const activeElement = document.activeElement as HTMLElement;
  const currentIndex = Array.from(checkboxes).indexOf(activeElement);
  if (currentIndex + 1 === checkboxes.length && host.value && !event.shiftKey) {
    event.preventDefault();
    host.value.focus();
    const focusableElements = getFocusableElements();
    const currentElement = document.activeElement as HTMLElement;

    const currentIndex = focusableElements.indexOf(currentElement);

    const nextIndex = (currentIndex + 1) % focusableElements.length;

    focusableElements[nextIndex].focus();

    isVisible.value = false;
    activeTracking.value = false;
    document.removeEventListener("click", handleClickOutside);
    document.removeEventListener("keydown", handleKeyDownEscape);
  }
};

const handleFocusPreviousElement = (event: KeyboardEvent) => {
  const currentElement = document.activeElement as HTMLElement;
  if (
    event.shiftKey &&
    ((currentElement === searchElement.value && !props.selectAll) ||
      currentElement === selectAllElement.value)
  ) {
    event.preventDefault();
    focusPreviousElement();
  }
};

const focusPreviousElement = () => {
  if (host.value) {
    isVisible.value = false;
    activeTracking.value = false;
    document.removeEventListener("click", handleClickOutside);
    document.removeEventListener("keydown", handleKeyDownEscape);
    host.value.focus();
    const focusableElements = getFocusableElements();
    const currentElement = document.activeElement as HTMLElement;

    const currentIndex = focusableElements.indexOf(currentElement);

    const previousIndex =
      (currentIndex - 1 + focusableElements.length) % focusableElements.length;

    focusableElements[previousIndex].focus();
  }
};

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleKeyDownEscape);
});

const defaultButtonLabel = computed(() => {
  const nbElements = model.value?.length;
  if (nbElements === 0) {
    return "Sélectionner une option";
  }
  return `${nbElements} option${nbElements > 1 ? "s" : ""} sélectionnée${nbElements > 1 ? "s" : ""}`;
});
</script>

<template>
  <div class="fr-select-group">
    <label class="fr-label" :for="id">
      <slot name="label">{{ props.label }}</slot>
      <slot name="required-tip">
        <span v-if="props.required" class="required">&nbsp;*</span>
      </slot>
      <span v-if="props.description || $slots.description" class="fr-hint-text">
        <slot name="description">{{ props.description }}</slot>
      </span>
    </label>
    <button
      :id="id"
      ref="host"
      type="button"
      class="fr-select fr-multi-select"
      :aria-expanded="isVisible"
      :aria-controls="`${id}-popover`"
      :class="{ 'fr-multi-select--is-open': isVisible }"
      @click="handleClick"
    >
      <slot name="button-label">
        {{ props.buttonLabel || defaultButtonLabel }}
      </slot>
    </button>
    <Teleport to="body">
      <CollapseTransition>
        <div
          v-if="isVisible"
          :id="`${id}-popover`"
          ref="popover"
          :style="{
            '--left-position': `${popoverPosition.x}px`,
            '--top-position': `${popoverPosition.y}px`,
            '--width-host': `${hostSize.width}px`,
          }"
          class="fr-multi-select__popover"
        >
          <p :id="`${id}-text-description`" class="fr-sr-only">
            Utilisez la tabulation (ou les touches flèches) pour naviguer dans
            la liste des suggestions
          </p>
          <ul v-if="selectAll" class="fr-btns-group">
            <li>
              <button
                ref="selectAllElement"
                type="button"
                :disabled="filterdOptions.length === 0"
                class="fr-btn fr-btn--sm fr-btn--secondary"
                @click="handleClickSelectAllClick"
                @keydown.shift.tab="handleFocusPreviousElement"
              >
                <span
                  class="fr-multi-select__search__icon"
                  :class="
                    isAllSelected
                      ? 'fr-icon-close-circle-line'
                      : 'fr-icon-check-line'
                  "
                ></span>
                {{ props.selectAllLabel[isAllSelected ? 1 : 0] }}
              </button>
            </li>
          </ul>
          <div v-if="props.search" class="fr-input-group">
            <div class="fr-input-wrap fr-icon-search-line">
              <input
                ref="searchElement"
                v-model="searchInput"
                class="fr-input"
                placeholder="Rechercher"
                :aria-describedby="`${id}-text-description`"
                type="text"
                :aria-controls="`${id}-checkboxes`"
                aria-live="polite"
                @keydown.down="handleFocusFirstCheckbox"
                @keydown.right="handleFocusFirstCheckbox"
                @keydown.tab="handleFocusPreviousElement"
              />
            </div>
            <div class="fr-messages-group" aria-live="assertive"></div>
          </div>
          <fieldset
            :id="`${id}-checkboxes`"
            class="fr-fieldset fr-multi-select__popover__fieldset"
            aria-live="polite"
            :style="{ '--maxOverflowHeight': `${props.maxOverflowHeight}` }"
          >
            <legend
              v-if="props.legend || $slots.legend"
              :id="`${id}-checkboxes-legend`"
              class="fr-fieldset__legend--regular fr-fieldset__legend"
            >
              <slot name="legend">{{ props.legend }}</slot>
            </legend>
            <div
              v-for="option in filterdOptions"
              :key="generateId(option, id, props.idKey) + '-checkbox'"
              class="fr-fieldset__element"
            >
              <div class="fr-checkbox-group fr-checkbox-group--sm">
                <input
                  :id="generateId(option, id, props.idKey) + '-checkbox'"
                  v-model="model"
                  type="checkbox"
                  :aria-describedby="
                    generateId(option, id, props.idKey) + '-message'
                  "
                  :value="getValueOrId(option, props.idKey)"
                  @keydown.down="handleFocusNextCheckbox"
                  @keydown.right="handleFocusNextCheckbox"
                  @keydown.up="handleFocusPreviousCheckbox"
                  @keydown.left="handleFocusPreviousCheckbox"
                  @keydown.tab="handleFocusNextElementUsingTab"
                />
                <label
                  class="fr-label"
                  :for="generateId(option, id, props.idKey) + '-checkbox'"
                >
                  <slot name="checkbox-label" :option="option">
                    {{ getValueOrId(option, props.labelKey) }}
                  </slot>
                </label>
                <div
                  :id="generateId(option, id, props.idKey) + '-message'"
                  class="fr-messages-group"
                  aria-live="assertive"
                />
              </div>
            </div>
          </fieldset>
          <div v-if="filterdOptions.length === 0">
            <slot name="no-results">Pas de résultat</slot>
          </div>
        </div>
      </CollapseTransition>
    </Teleport>
  </div>
</template>

<style scoped>
.fr-multi-select {
  text-align: left;
  background-image: none;
  display: inline-flex;
  flex-direction: row;
  padding: 0.75rem 1rem;
}

.fr-multi-select::after {
  --icon-size: 1rem;
  background-color: currentColor;
  content: "";
  display: inline-block;
  flex: 0 0 auto;
  height: 1rem;
  height: var(--icon-size);
  margin-left: auto;
  margin-right: 0;
  -webkit-mask-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZD0ibTEyIDEzLjE3MiA0Ljk1LTQuOTUgMS40MTQgMS40MTRMMTIgMTYgNS42MzYgOS42MzYgNy4wNSA4LjIyMmw0Ljk1IDQuOTVaIi8+PC9zdmc+);
  mask-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZD0ibTEyIDEzLjE3MiA0Ljk1LTQuOTUgMS40MTQgMS40MTRMMTIgMTYgNS42MzYgOS42MzYgNy4wNSA4LjIyMmw0Ljk1IDQuOTVaIi8+PC9zdmc+);
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  transition: transform 0.3s;
  vertical-align: calc(0.375em - 0.5rem);
  vertical-align: calc((0.75em - var(--icon-size)) * 0.5);
  width: 1rem;
  width: var(--icon-size);
  margin-top: auto;
  margin-bottom: auto;
}

.fr-multi-select--is-open::after {
  transform: rotate(-180deg);
}

.fr-multi-select__search__icon {
  margin-right: 1rem;
}

.fr-multi-select__popover {
  z-index: 20000;
  position: absolute;
  transform-origin: left top;
  width: var(--width-host);
  left: var(--left-position);
  top: var(--top-position);
  padding: 1rem;
  margin-top: 4px;
  background-color: var(--background-overlap-grey);
  filter: drop-shadow(var(--overlap-shadow));
}

.fr-multi-select__popover__fieldset {
  max-height: var(--maxOverflowHeight);
  overflow: auto;
}
</style>
