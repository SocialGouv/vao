<template>
  <div class="fr-fieldset__element">
    <div v-if="!props.modifiable">
      <dl class="fr-text--sm fr-pl-0">
        <dt v-if="label">{{ label }}</dt>
        <dd>
          <DsfrTable
            v-if="rows.length > 0"
            title="Fichier(s) téléversé(s)"
            :headers="headers"
            :rows="rows"
          />
          <p v-else class="fr-mb-4v fr-icon-file-line fr-text--sm">
            Aucun fichier téléversé
          </p>
          <p v-if="hint" class="fr-hint-text">
            {{ hint }}
          </p>
        </dd>
      </dl>
    </div>
    <div v-else class="fr-input-group">
      <p v-if="rows.length > 0">
        <DsfrTable
          title="Fichier(s) téléversé(s)"
          :headers="headers"
          :rows="rows"
        />
      </p>
      <p v-else class="fr-mb-4v fr-icon-file-line fr-text--sm">
        Aucun fichier téléversé
      </p>
      <DsfrFileUpload v-bind="$attrs" @change="onFileInputChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from "vue";
import type { PropType } from "vue";
import type { UploadedFile } from "@vao/shared-bridge";

import dayjs from "dayjs";

const props = defineProps({
  modifiable: { type: Boolean, default: true },
  cdnUrl: { type: String, required: true },
});

const attrs = useAttrs();
const label = computed(() =>
  typeof attrs.label === "string" ? attrs.label : "",
);
const hint = computed(() => (typeof attrs.hint === "string" ? attrs.hint : ""));

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
            href: `${props.cdnUrl}${props.cdnUrl.endsWith("/") ? "" : "/"}${(file as UploadedFile).uuid}`,
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
