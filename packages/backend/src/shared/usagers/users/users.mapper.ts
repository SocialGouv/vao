import { UserUsagersDto } from "@vao/shared-bridge";

import { mapUserBase } from "../../users/users.mapper";
import { UserUsagersEntity } from "./users.entity";

export const UsersUsagersMapper = {
  toDto: (entity: UserUsagersEntity): UserUsagersDto => ({
    ...mapUserBase(entity),
    userSiret: entity.siret,
  }),

  toDtos: (entities: UserUsagersEntity[]): UserUsagersDto[] =>
    entities.map(UsersUsagersMapper.toDto),
};
