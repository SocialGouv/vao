export const exportCsv = (data, title) => {
  const universalBOM = "\uFEFF";
  const a = window.document.createElement("a");
  a.setAttribute(
    "href",
    "data:text/csv; charset=utf-8," + encodeURIComponent(universalBOM + data),
  );
  a.setAttribute("download", title);
  window.document.body.appendChild(a);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
