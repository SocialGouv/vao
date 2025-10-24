export const formatDateFr = (dateString: Date | undefined): string => {
  return dateString
    ? new Date(dateString).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";
};
