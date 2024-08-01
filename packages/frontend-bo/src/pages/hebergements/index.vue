<script setup>
definePageMeta({
  middleware: ["is-connected", "check-role", "redirect-on-hebergements"],
  roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
});
</script>
