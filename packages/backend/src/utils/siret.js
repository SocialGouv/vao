function formatByPattern(pattern, input = "", separator = " ") {
  if (typeof input !== "string") input = String(input ?? "");
  const expectedLength = pattern.reduce((a, b) => a + b, 0);
  if (input.length !== expectedLength || !/^\d+$/.test(input)) return input;

  let i = 0;
  return pattern
    .map((len) => {
      const part = input.slice(i, i + len);
      i += len;
      return part;
    })
    .join(separator);
}

function formatSiret(s) {
  return formatByPattern([3, 3, 3, 5], s);
}

function formatSiren(s) {
  return formatByPattern([3, 3, 3], s);
}
module.exports = { formatSiren, formatSiret };
