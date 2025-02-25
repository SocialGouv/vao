import { Injectable } from "@nestjs/common";

import type { User } from "../schemas/user.schema";
import { UserService } from "../user/user.service";

@Injectable()
export class AuthService {
  constructor(private usersService: UserService) {}

  async validateUser(apiToken: User["apiToken"]): Promise<User | null> {
    const user = await this.usersService.findOne(apiToken);
    if (!user || new Date(user.expiresAt) <= new Date()) {
      return null;
    }
    return user;
  }
}
