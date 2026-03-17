import { randomInt } from "crypto";

const usedSirets = new Set<string>();

export const generateRandomSiret = (): string => {
  for (let attempt = 0; attempt < 1000; attempt += 1) {
    // 14 digits, first digit non-zero
    const siret = randomInt(10_000_000_000_000, 100_000_000_000_000).toString();
    if (!usedSirets.has(siret)) {
      usedSirets.add(siret);
      return siret;
    }
  }
  throw new Error("Unable to generate random SIRET");
};
