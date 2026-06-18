import type { FeatureFlagDto } from "@vao/shared-bridge";

import { getPool } from "../../utils/pgpool";

function mapToDto(row: {
  name: string;
  description: string;
  enabled: boolean;
  date_from: Date | null;
  date_to: Date | null;
  created_at: Date;
  updated_at: Date;
}): FeatureFlagDto {
  return {
    createdAt: row.created_at,
    dateFrom: row.date_from,
    dateTo: row.date_to,
    description: row.description,
    enabled: row.enabled,
    name: row.name,
    updatedAt: row.updated_at,
  };
}

async function findOneByName(name: string): Promise<FeatureFlagDto | null> {
  const result = await getPool().query(
    `SELECT name, description, enabled,
            date_from, date_to, created_at, updated_at
     FROM feature_flags
     WHERE name = $1`,
    [name],
  );
  const row = result.rows[0];
  return row ? mapToDto(row) : null;
}

async function findAll(): Promise<FeatureFlagDto[]> {
  const result = await getPool().query(
    `SELECT name, description, enabled,
            date_from, date_to, created_at, updated_at
     FROM feature_flags`,
  );
  return result.rows.map(mapToDto);
}

export const FeatureFlagRepository = {
  findAll,
  findOneByName,
};
