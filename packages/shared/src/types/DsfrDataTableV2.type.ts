import type {
  NestedKeys as ImportedNestedKeys,
  Titles as ImportedTitles,
  SlotProps as ImportedSlotProps,
  ValueFromNestedKey as ImportedValueFromNestedKey,
} from "../components/Table/DsfrDataTableV2.vue";

export type NestedKeys<T> = ImportedNestedKeys<T>;
export type Titles<T> = ImportedTitles<T>;
export type SlotProps<T> = ImportedSlotProps<T>;
export type ValueFromNestedKey<
  T,
  U extends string,
> = ImportedValueFromNestedKey<T, U>;
