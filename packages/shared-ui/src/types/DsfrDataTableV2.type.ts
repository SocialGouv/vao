import type {
  NestedKeys as ImportedNestedKeys,
  Columns as ImportedColumns,
  Slots as ImportedSlots,
  ValueFromNestedKey as ImportedValueFromNestedKey,
  Row as ImportedRow,
} from "../components/Table/DsfrDataTableV2.vue";

export type NestedKeys<T> = ImportedNestedKeys<T>;
export type Columns<T> = ImportedColumns<T>;
export type Slots<T> = ImportedSlots<T>;
export type ValueFromNestedKey<
  T,
  U extends string,
> = ImportedValueFromNestedKey<T, U>;
export type Row = ImportedRow;
