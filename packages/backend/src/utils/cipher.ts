import * as Sentry from "@sentry/node";
import crypto from "crypto";

import { config } from "../config";
import { logger } from "../utils/logger";

const log = logger(module.filename);

const algorithm = "aes-256-gcm";

// Clé de 32 octets (256 bits), encodée en hex dans la variable d'environnement
const secretKey = Buffer.from(process.env.PG_VAO_CIPHER_DATA!, "hex");

// Encrypt function
export function encrypt(data: string | object) {
  try {
    const text = typeof data === "string" ? data : JSON.stringify(data);
    const iv = crypto.randomBytes(12); // 12 bytes recommandés pour GCM
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

    const encrypted = Buffer.concat([
      cipher.update(text, "utf8"),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return {
      content: encrypted.toString("hex"),
      iv: iv.toString("hex"),
      tag: authTag.toString("hex"),
    };
  } catch (error) {
    log.w("Erreur lors de l'encryptage:", error);
    if (config.sentry.enabled) {
      Sentry.captureException(error);
    }
    throw error;
  }
}

// Decrypt function
export function decrypt(data: any) {
  let text;

  try {
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (error) {
        log.w("Erreur JSON.parse dans decrypt:", error);
        if (config.sentry.enabled) {
          Sentry.captureException(error);
        }
        throw error;
      }
    }

    if (!data || !data.iv || !data.content || !data.tag) {
      log.w("Données manquantes pour le décryptage");
      return null;
    }

    const decipher = crypto.createDecipheriv(
      algorithm,
      secretKey,
      Buffer.from(data.iv, "hex"),
    );

    decipher.setAuthTag(Buffer.from(data.tag, "hex"));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(data.content, "hex")),
      decipher.final(),
    ]);

    text = decrypted.toString("utf8");
  } catch (error) {
    log.w("Erreur lors du décryptage:", error);
    if (config.sentry.enabled) {
      Sentry.captureException(error);
    }
    throw error;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
