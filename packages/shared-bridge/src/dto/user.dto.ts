import { UserAdminDto } from "./userAdmin.dto";
import { UserUsagersDto } from "./userUsagers.dto";

export type UserDto = UserAdminDto | UserUsagersDto;
