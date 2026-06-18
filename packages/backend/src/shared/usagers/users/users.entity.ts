import { UserEntity } from "../../users/users.entity";

export interface UserUsagersEntity extends UserEntity {
  siret: string;
}
