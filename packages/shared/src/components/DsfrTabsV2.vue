<script lang="ts" setup>
import { onMounted, onUnmounted, ref, computed } from "vue";

const props = defineProps<{
  tabs: {
    label: string;
    tabPanelId: string;
    tabId: string;
  }[];
  modelValue: number;
}>();

const emits = defineEmits<{
  "update:modelValue": [number];
}>();

const activeTab = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emits("update:modelValue", value);
  },
});
const tabsStyle = ref({ "--tabs-height": "100px" });

const $el = ref<HTMLElement | null>(null);
const tablist = ref<HTMLUListElement | null>(null);

const renderTabs = () => {
  if (activeTab.value < 0) {
    return;
  }
  if (!tablist.value || !tablist.value.offsetHeight) {
    return;
  }
  const tablistHeight = tablist.value.offsetHeight;
  const selectedTab = $el.value?.querySelector(".fr-tabs__panel");
  if (!selectedTab || !(selectedTab as HTMLElement).offsetHeight) {
    return;
  }
  const selectedTabHeight = (selectedTab as HTMLElement).offsetHeight;
  tabsStyle.value["--tabs-height"] = `${tablistHeight + selectedTabHeight}px`;
};

const animationDirection = ref("right");

const selectTab = (index: number) => {
  unobservePanel();
  animationDirection.value = activeTab.value > index ? "left" : "right";
  activeTab.value = index;
};

const selectPrevious = () => {
  unobservePanel();
  const newIndex =
    activeTab.value === 0 ? props.tabs.length - 1 : activeTab.value - 1;
  animationDirection.value = "left";
  activeTab.value = newIndex;
};
const selectNext = () => {
  unobservePanel();
  const newIndex =
    activeTab.value === props.tabs.length - 1 ? 0 : activeTab.value + 1;
  animationDirection.value = "right";
  activeTab.value = newIndex;
};
const selectFirst = () => {
  unobservePanel();
  animationDirection.value = "left";
  activeTab.value = 0;
};
const selectLast = () => {
  unobservePanel();
  animationDirection.value = "right";
  activeTab.value = props.tabs.length - 1;
};

const observePanel = () => {
  const panel = $el.value?.querySelector(".fr-tabs__panel");
  if (panel) {
    resizeObserver.value?.observe(panel);
  }
};

const unobservePanel = () => {
  const panel = $el.value?.querySelector(".fr-tabs__panel");
  if (panel) {
    resizeObserver.value?.unobserve(panel);
  }
};

const resizeObserver = ref<ResizeObserver | null>(null);
onMounted(() => {
  if (window.ResizeObserver) {
    resizeObserver.value = new window.ResizeObserver(() => {
      renderTabs();
    });
  }
  observePanel();
});

onUnmounted(() => {
  unobservePanel();
});

const animationEnd = () => {
  renderTabs();
  observePanel();
};
</script>

<template>
  <div ref="$el" class="fr-tabs" :style="tabsStyle">
    <ul
      ref="tablist"
      class="fr-tabs__list"
      role="tablist"
      aria-label="[A modifier | nom du système d'onglet]"
    >
      <dsfr-tab-item
        v-for="(tab, index) in tabs"
        :key="tab.tabId"
        :label="tab.label"
        :tab-id="tab.tabId"
        :tab-panel-id="tab.tabPanelId"
        :selected="activeTab === index"
        @click="selectTab(index)"
        @next="selectNext()"
        @previous="selectPrevious()"
        @first="selectFirst()"
        @last="selectLast()"
      />
    </ul>
    <transition
      :name="`translate-fade-${animationDirection}`"
      mode="out-in"
      @after-leave="animationEnd"
    >
      <slot />
    </transition>
  </div>
</template>

<style scoped>
.translate-fade-right-enter-active,
.translate-fade-right-leave-active {
  transition: all 0.25s ease-out;
}

.translate-fade-right-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.translate-fade-right-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.translate-fade-left-enter-active,
.translate-fade-left-leave-active {
  transition: all 0.25s ease-out;
}

.translate-fade-left-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}

.translate-fade-left-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
