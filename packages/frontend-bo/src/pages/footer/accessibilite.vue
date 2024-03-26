<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div class="fr-col">
        <DsfrBreadcrumb :links="links" />
      </div>
    </div>

    <div class="fr-grid-row">
      <div class="fr-col">
        <h1>Accessibilité</h1>
      </div>
    </div>
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <h4>Pas vraiment tip top</h4>
        <span>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          et bibendum lorem, a efficitur ante. Vivamus sit amet fringilla neque.
          Vestibulum in velit egestas, tempus lectus quis, luctus mauris. Aenean
          sit amet lacus id mauris facilisis dictum sed faucibus nulla. Donec
          orci ex, dignissim id egestas quis, aliquet ut nunc. Nam vestibulum
          quis lacus pellentesque ultrices. Donec mollis diam eget est hendrerit
          viverra. Morbi eu nisl nibh. Fusce in imperdiet eros, vitae interdum
          neque. Nam auctor dictum dui, sed ullamcorper augue mollis suscipit.
          Fusce euismod scelerisque blandit. Fusce pretium, dolor porttitor
          mattis venenatis, ex velit placerat nunc, non pharetra justo turpis
          non ex. Class aptent taciti sociosqu ad litora torquent per conubia
          nostra, per inceptos himenaeos. Donec lacus lorem, tincidunt ut velit
          et, porttitor iaculis erat. Phasellus posuere auctor velit non
          dapibus. Sed a neque et dui pulvinar cursus. Donec vitae mi ac orci
          ultrices molestie. Vivamus at urna et sapien feugiat dictum.
          Vestibulum vehicula mi dui, ut egestas odio egestas et. Aenean viverra
          scelerisque justo, at mattis ex eleifend a. Morbi ultrices mauris
          erat. Vestibulum eu dapibus felis, ac lacinia sem. Sed non erat
          laoreet, rhoncus tortor a, auctor metus.
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    text: "Accessibilite",
  },
];
</script>
