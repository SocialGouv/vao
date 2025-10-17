<script setup>
const props = defineProps({
  id: { type: String, required: true },
  hint: { type: String, default: "" },
  label: { type: String, default: "" },
  labelClass: { type: String, default: "" },
  modelValue: { type: String, default: "" },
  wrapperClass: { type: String, default: "" },
  errorMessage: undefined,
  validMessage: undefined,
});

defineEmits(["update:modelValue"]);

const message = computed(() => props.errorMessage || props.validMessage);
const messageClass = computed(() =>
  props.errorMessage ? "fr-error-text" : "fr-valid-text",
);
const isInvalid = computed(() => !!props.errorMessage);
const isValid = computed(() => !!props.errorMessage);

const descriptionId = computed(() => props.id + "-description");
const hidePassword = ref(true);
const liveMessage = ref("");
const type = computed(() =>
  hidePassword.value === true ? "password" : "text",
);
const icon = computed(() => {
  return hidePassword.value ? "ri:eye-line" : "ri:eye-off-line";
});

const togglePasswordLabel = computed(() =>
  hidePassword.value ? "Afficher le mot de passe" : "Masquer le mot de passe",
);

const finalLabelClass = computed(() => ["fr-label", props.labelClass]);

function togglePasswordType() {
  hidePassword.value = !hidePassword.value;
  liveMessage.value = hidePassword.value
    ? "Mot de passe maintenant masqué"
    : "Mot de passe maintenant affiché";
}
</script>

<template>
  <div
    class="fr-input-group"
    :class="{
      'fr-input-group--error': errorMessage,
      'fr-input-group--valid': validMessage,
    }"
  >
    <label :class="finalLabelClass" :for="id">
      <slot name="label">
        {{ label }}
        <slot name="required-tip">
          <span
            v-if="'required' in $attrs && $attrs.required !== false"
            class="required"
            >*</span
          >
        </slot>
      </slot>
      <span v-if="hint" class="fr-hint-text">{{ hint }}</span>
    </label>

    <DsfrButton
      class="show-password"
      type="button"
      style="float: right"
      :icon="icon"
      :tertiary="true"
      :no-outline="true"
      :aria-controls="id"
      :aria-label="togglePasswordLabel"
      @click.prevent="togglePasswordType"
    />

    <!-- Ajout de la phrase d'état pour les lecteurs d'écran -->
    <span aria-live="polite" class="fr-sr-only" role="status">
      {{ liveMessage }}
    </span>

    <input
      :id="id"
      v-bind="$attrs"
      :type="type"
      class="fr-input"
      :class="{
        'fr-input--error': isInvalid,
        'fr-input--valid': isValid,
      }"
      :value="modelValue"
      :aria-describedby="descriptionId || null"
      @input="$emit('update:modelValue', $event.target.value)"
    />

    <div v-if="message" class="fr-messages-group">
      <p :id="descriptionId" :data-testid="descriptionId" :class="messageClass">
        <span>{{ message }}</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.invisible {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.show-password {
  gap: 0;
}
</style>
