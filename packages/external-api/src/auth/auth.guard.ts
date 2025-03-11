import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { AuthGuardRequest } from "../types/auth.type";
import { AuthService } from "./auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  private failedAttempts: Map<string, { count: number; banUntil?: Date }> =
    new Map();

  private readonly MAX_ATTEMPTS = 5;
  private readonly BAN_TIME = 60 * 1000;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthGuardRequest>();
    const clientIp = request.ip;

    if (clientIp) {
      const ipRecord = this.failedAttempts.get(clientIp);
      if (ipRecord?.banUntil && ipRecord.banUntil > new Date()) {
        throw new UnauthorizedException(
          "Too many failed attempts, IP is banned.",
        );
      }
    }

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      if (clientIp) {
        this.handleFailure(clientIp);
      }
      throw new UnauthorizedException(
        "Unauthorized, invalid or missing token.",
      );
    }
    const user = await this.authService.validateUser(token);
    if (!user) {
      if (clientIp) {
        this.handleFailure(clientIp);
      }
      throw new UnauthorizedException(
        "Unauthorized, invalid or missing token.",
      );
    }
    if (clientIp) {
      this.resetFailures(clientIp);
    }
    request["user"] = { email: user.email, id: user.id };
    return true;
  }

  private extractTokenFromHeader(
    request: AuthGuardRequest,
  ): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }

  private handleFailure(clientIp: string) {
    const now = new Date();
    const record = this.failedAttempts.get(clientIp);

    if (!record || (record.banUntil && record.banUntil < new Date())) {
      this.failedAttempts.set(clientIp, { count: 1 });
    } else {
      const newCount = record.count + 1;
      if (newCount >= this.MAX_ATTEMPTS) {
        this.failedAttempts.set(clientIp, {
          banUntil: new Date(now.getTime() + this.BAN_TIME),
          count: newCount,
        });
      } else {
        this.failedAttempts.set(clientIp, { count: newCount });
      }
    }
  }

  private resetFailures(clientIp: string): void {
    this.failedAttempts.delete(clientIp);
  }
}
