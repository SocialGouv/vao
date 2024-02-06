module.exports.merge = (tFilters, tPermissions) => ({
  query: tFilters.query + tPermissions.query,
  values: tFilters.values.concat(tPermissions.values),
});
