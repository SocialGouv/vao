const typeLabelByValue: Record<string, string> = {
  hotel: "Hôtel",
  meuble_tourisme: "Meublé de tourisme",
  residence_tourisme: "Résidence de tourisme, chambre d'hôte",
  camping: "Camping, caravaning, mobile home",
  autre: "Autre",
};

export function getHebergementTypeLabel(
  value: string | null | undefined,
): string {
  if (!value) {
    return "";
  }
  return typeLabelByValue[value] ?? value;
}
