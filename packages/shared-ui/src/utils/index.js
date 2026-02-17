import createLogger from "./createLogger";
import hebergement from "./hebergement";

import { getTagSejourLibelle, mapEigToLabel } from "./eigUtils";
import messageUtils from "./messageUtils";
import MessageHover from "../components/messages/MessageHover.vue";
import MessageEtat from "../components/messages/MessageEtat.vue";
import status from "./status";
import statusUser from "./statusUser";
import columnsTable from "./columnsTable";
import * as fileUtils from "./file";

const regex = hebergement;
const eigUtilsHebergement = hebergement;

const eigUtils = {
  ...eigUtilsHebergement,
  getTagSejourLibelle,
  mapEigToLabel,
};

export {
  createLogger,
  columnsTable,
  hebergement,
  regex,
  eigUtils,
  messageUtils,
  MessageHover,
  MessageEtat,
  status,
  statusUser,
  fileUtils,
};
