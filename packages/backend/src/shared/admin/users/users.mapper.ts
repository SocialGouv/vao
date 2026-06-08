import { UserAdminDto } from "@vao/shared-bridge";

import { mapUserBase } from "../../users/users.mapper";
import { UserAdminEntity } from "./users.entity";

export const UsersAdminMapper = {
  toDto: (entity: UserAdminEntity): UserAdminDto => ({
    ...mapUserBase(entity),
    territoireCode: entity.ter_code,
  }),

  toDtos: (entities: UserAdminEntity[]): UserAdminDto[] =>
    entities.map(UsersAdminMapper.toDto),
};
