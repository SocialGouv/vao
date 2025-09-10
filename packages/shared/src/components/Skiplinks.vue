<script setup>
import { useRoute } from "#imports";

let removeFirstTabListener = null;
let skipLinksDisabled = false;

onUnmounted(() => {
  if (removeFirstTabListener) removeFirstTabListener();
});

function setupSkipLinkFocus() {
  if (removeFirstTabListener) removeFirstTabListener();

  skipLinksDisabled = false;

  let handled = false;

  function onFirstTab(e) {
    if (!handled && e.key === "Tab" && !skipLinksDisabled) {
      e.preventDefault();
      const skipLink = document.querySelector(".fr-skiplinks a");

      if (skipLink) {
        skipLink.focus();
        handled = true;
        document.removeEventListener("keydown", onFirstTab);
      }
    }
  }

  handled = false;
  document.addEventListener("keydown", onFirstTab);

  removeFirstTabListener = () =>
    document.removeEventListener("keydown", onFirstTab);

  document.querySelectorAll(".fr-skiplinks a").forEach((link) => {
    const existingHandler = link._skipLinkHandler;

    if (existingHandler) {
      link.removeEventListener("click", existingHandler);
    }

    const clickHandler = (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href")?.replace("#", "");
      if (targetId) {
        const target = document.getElementById(targetId);
        if (target) {
          nextTick(() => {
            target.setAttribute("tabindex", "-1");
            target.focus();
            skipLinksDisabled = true;
            removeFirstTabListener();
          });
        }
      }
    };

    link._skipLinkHandler = clickHandler;
    link.addEventListener("click", clickHandler);
  });
}

const route = useRoute();
onMounted(setupSkipLinkFocus);

watch(() => route.path, setupSkipLinkFocus);
</script>

<template>
  <div class="fr-skiplinks">
    <nav class="fr-container" role="navigation" aria-label="Accès rapide">
      <ul class="fr-skiplinks__list">
        <li>
          <a class="fr-link" href="#menu">Menu</a>
        </li>
        <li>
          <a class="fr-link" href="#content">Contenu</a>
        </li>
        <li>
          <a class="fr-link" href="#footer">Pied de page</a>
        </li>
      </ul>
    </nav>
  </div>
</template>
