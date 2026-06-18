<template>
  <component
    :is="asTag"
    v-bind="componentAttrs"
    :class="mergedClassNames"
    v-on="asTag === 'button' ? { click: onClick } : {}"
  >
    <span v-if="iconName" :class="computedIconClass" aria-hidden="true"></span>
    <slot>{{ text }}</slot>
  </component>
</template>

<script>
export default {
  name: "DsfrLinkV2",
  props: {
    onClick: {
      type: Function,
      default: null,
    },
    as: {
      type: String,
      default: "a", // "a" ou "button"
      validator: (value) => ["a", "button"].includes(value),
    },
    href: {
      type: String,
      default: "#",
    },
    text: {
      type: String,
      default: "modifier",
    },
    iconName: {
      type: String,
      default: "",
    },
    customClass: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "button",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    asTag() {
      return this.as;
    },
    componentAttrs() {
      if (this.as === "a") {
        return { href: this.href };
      } else {
        return { type: this.type, disabled: this.disabled };
      }
    },
    computedIconClass() {
      if (!this.iconName) return "";
      const name = this.iconName.startsWith("fr-")
        ? this.iconName
        : `fr-${this.iconName}`;
      return name + " fr-icon--sm fr-pr-2v";
    },
    mergedClassNames() {
      const base = "fr-link";
      return this.customClass ? `${base} ${this.customClass}` : base;
    },
  },
};
</script>
<style scoped>
.fr-link {
  border-bottom: 1px solid currentColor;
}
</style>
