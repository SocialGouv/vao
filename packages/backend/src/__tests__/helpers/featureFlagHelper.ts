import { FeatureFlagName } from "@vao/shared-bridge";

import { getPool } from "../../utils/pgpool";

export const createFeatureFlag = async ({
  name,
  label,
  enabled,
}: {
  name?: FeatureFlagName | null;
  label?: string | null;
  enabled?: boolean | null;
}): Promise<string> => {
  let result = await getPool().query(
    `SELECT * FROM public.feature_flags WHERE name = $1`,
    [name ?? FeatureFlagName.AUTH_2FA],
  );
  if (result.rowCount === 0) {
    result = await getPool().query(
      `INSERT INTO public.feature_flags ("name", description, enabled, date_from, date_to, created_at, updated_at) VALUES($1, $2, $3, null, null,now(),now()) RETURNING name`,
      [
        name ?? FeatureFlagName.AUTH_2FA,
        label ?? "Authentification double facteurs",
        enabled ?? true,
      ],
    );
  }

  const nameFF = result.rows[0].name;
  return nameFF;
};

export const resetFeatureFlag = async (): Promise<void> => {
  await getPool().query(`DELETE FROM public.feature_flags`);
};
