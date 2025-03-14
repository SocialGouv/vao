import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse } from "@nestjs/swagger";

@Controller("health")
export class HealthController {
  @Get()
  @ApiOkResponse({
    description: "Health check.",
  })
  healthCheck(): { status: string } {
    return { status: "ok" };
  }
}
