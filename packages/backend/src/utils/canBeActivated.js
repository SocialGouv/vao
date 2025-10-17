const { status } = require("../helpers/users");

function canBeActivated(statusCode) {
  return (
    statusCode === status.TEMPORARY_BLOCKED ||
    statusCode === status.NEED_EMAIL_VALIDATION
  );
}
module.exports.canBeActivated = canBeActivated;
