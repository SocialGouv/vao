import { UserEntity } from "../../users/users.entity";

export interface UserAdminEntity extends UserEntity {
  ter_code: string;
}
