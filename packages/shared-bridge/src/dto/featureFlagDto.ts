export interface FeatureFlagDto {
  name: string;
  description: string;
  enabled: boolean;
  dateFrom: Date | null;
  dateTo: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
