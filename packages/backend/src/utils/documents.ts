import { AgrementService } from "../admin/agrements/agrements.service";
import DemandeSejour from "../services/DemandeSejour";
import Hebergement from "../services/hebergement/Hebergement";
import Message from "../services/Message";
import Organisme from "../services/Organisme";
import ProtocoleSanitaire from "../services/organisme/ProtocoleSanitaire";
import ProtocoleTransport from "../services/organisme/ProtocoleTransport";

export async function resolveDemandeSejourId(
  uuid: string,
): Promise<number | null> {
  const ds = await DemandeSejour.getByUuid(uuid);
  return ds?.id ?? null;
}

export async function resolveAgrementId(uuid: string): Promise<number | null> {
  return AgrementService.getIdByFileUuid(uuid);
}

export async function resolveHebergementId(
  uuid: string,
): Promise<number | null> {
  const hebergement = await Hebergement.getByUuid(uuid);
  return hebergement?.id ?? null;
}

export async function resolveMessageDemandeSejourId(
  uuid: string,
): Promise<number | null> {
  const message = await Message.getDsIdByUuid(uuid);
  return message?.declarationId ?? null;
}

export async function resolveProtocoleSanitaireAgrementId(
  uuid: string,
): Promise<number | null> {
  const protocole = await ProtocoleSanitaire.getOrgIdByUuid(uuid);
  if (!protocole?.organismeId) {
    return null;
  }
  return Organisme.getAgrementById(protocole.organismeId);
}

export async function resolveProtocoleTransportAgrementId(
  uuid: string,
): Promise<number | null> {
  const protocole = await ProtocoleTransport.getOrgIdByUuid(uuid);
  if (!protocole?.organismeId) {
    return null;
  }
  return Organisme.getAgrementById(protocole.organismeId);
}
