import type { UserAdminDto } from "./userAdmin.dto";
import type { UserUsagersDto } from "./userUsagers.dto";

export type UserDto = UserAdminDto & UserUsagersDto;
