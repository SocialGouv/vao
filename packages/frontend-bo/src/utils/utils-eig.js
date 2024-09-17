const isUserDreetsWhoDeliveredAgrement = (user, eig) =>
  user.territoireCode === eig.agrementRegionObtention;

const isUserDdetsWhereEigHappened = (user, eig) =>
  user.territoireCode === eig.departement;

const mustMarkAsRead = (eig, user) =>
  (!eig.readByDdets && isUserDdetsWhereEigHappened(user, eig)) ||
  (!eig.readByDreets && isUserDreetsWhoDeliveredAgrement(user, eig));

export default {
  isUserDreetsWhoDeliveredAgrement,
  isUserDdetsWhereEigHappened,
  mustMarkAsRead,
};
