<template>
  <div class="fr-fieldset__element">
    <div v-if="rows.length > 0">
      <DsfrTable
        title="Fichier(s) téléversé(s)"
        :headers="headers"
        :rows="rows"
      />
    </div>
    <div class="fr-input-group">
      <DsfrFileUpload
        v-if="modifiable"
        v-bind="$attrs"
        @change="onFileInputChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { PropType } from "vue";
import type { UploadedFile } from "@vao/shared-bridge";

import dayjs from "dayjs";

const props = defineProps({
  modifiable: { type: Boolean, default: true },
  cdnUrl: { type: String, required: true },
});

const headers: string[] = ["Fichier", "Date de création", "Actions"];

const files = defineModel<any | undefined | any[] | undefined[]>({
  type: Array as PropType<UploadedFile[]>,
});

const rows = computed(() => {
  const fileList = files.value as UploadedFile[] | undefined;
  if (!fileList) return [];
  return fileList.map((file, index: number) => {
    const name =
      file && typeof file === "object" && "uuid" in file && file.uuid
        ? {
            component: "a",
            text: (file as UploadedFile).name,
            href: `${props.cdnUrl}${(file as UploadedFile).uuid}`,
            download: true,
          }
        : (file as UploadedFile).name;
    const buttons = [
      {
        icon: "ri:delete-bin-2-line",
        iconOnly: true,
        tertiary: true,
        noOutline: true,
        onClick: () => removeFile(index),
        ariaLabel: `Supprimer le fichier ${(file as UploadedFile).name}`,
      },
    ];
    const createdAt = (file as UploadedFile).createdAt
      ? dayjs((file as UploadedFile).createdAt).format("YYYY-MM-DD HH:mm")
      : "";
    return [
      name,
      createdAt,
      {
        component: "DsfrButtonGroup",
        buttons: props.modifiable ? buttons : undefined,
      },
    ];
  });
});

function removeFile(index: number): void {
  const fileList = files.value as UploadedFile[] | undefined;
  if (!fileList) return;
  files.value = [...fileList.slice(0, index), ...fileList.slice(index + 1)];
}

function onFileInputChange(fileList: FileList): void {
  const arr: UploadedFile[] = Array.from(fileList).map((file) => ({
    name: file.name,
    // uuid et createdAt seront ajoutés côté backend ou lors de l'upload effectif
  }));
  const current = files.value as UploadedFile[] | undefined;
  files.value = [...(current || []), ...arr];
}
</script>

<style lang="scss" scoped></style>
