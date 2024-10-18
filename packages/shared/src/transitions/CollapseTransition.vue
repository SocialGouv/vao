<template>
  <transition
    ref="transition"
    name="collapse"
    @before-enter="beforeEnter"
    @enter="enter"
    @after-enter="afterEnter"
    @before-leave="beforeLeave"
    @leave="leave"
    @after-leave="afterLeave"
  >
    <slot></slot>
  </transition>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import type { VNode } from "vue";

const transition = ref<HTMLElement | null>(null);

const beforeEnter = (el: HTMLElement) => {
  el.style.height = "0";
  el.style.overflow = "hidden";
};

const enter = (el: HTMLElement) => {
  el.style.height = el.scrollHeight + "px";
  // scroll spawn with 100px set it to 0;
  nextTick(() => {
    el.scrollTop = 0;
  });
};

const afterEnter = (el: HTMLElement) => {
  el.style.overflow = "";
  el.style.height = "auto";
};

const beforeLeave = (el: HTMLElement) => {
  el.style.height = el.scrollHeight + "px";
  el.style.overflow = "hidden";
};

const leave = (el: HTMLElement) => {
  el.style.height = "0";
};

const afterLeave = (el: HTMLElement) => {
  el.style.height = "";
};

defineSlots<{
  default: () => VNode;
}>();
</script>

<style scoped>
/* Les transitions pour le collapse */
.collapse-enter-active,
.collapse-leave-active {
  overflow: hidden;
  transition: 0.5s;
}
</style>
