<script setup>
const props = defineProps({
  serviceTitle: {
    type: String,
    required: false,
    default: "Vacances Adaptées Organisées (VAO)",
  },
  serviceDescription: {
    type: String,
    required: false,
    default:
      "La plateforme de déclaration et suivi des séjours organisés pour les personnes handicapées majeures",
  },
  navItems: { type: Array, required: true },
  quickLinks: { type: Array, required: true },
  homeTo: { type: [String, Object], required: true },
});
const logoText = ["Republique", "française"];
</script>

<template>
  <DsfrHeader
    id="header"
    :service-title="props.serviceTitle"
    :service-description="props.serviceDescription"
    :home-to="props.homeTo"
    :quick-links="props.quickLinks"
    :show-search="false"
    :logo-text="logoText"
  >
    <template #mainnav>
      <DsfrNavigation id="menu" :nav-items="props.navItems" />
    </template>
  </DsfrHeader>
</template>
