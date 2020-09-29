import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";
import { TracingService, Tags } from "../../core";

@Injectable()
export class HttpTracingMiddleware implements NestMiddleware {
  constructor(private readonly tracingService: TracingService) {}

  use(req: Request, res: Response, next: () => void) {
    const rootSpan = this.tracingService.getSpanFromRequest(req);
    this.tracingService.setRootSpan(rootSpan);

    const finishSpan = () => {
      rootSpan.setTag(Tags.HTTP_STATUS_CODE, res.statusCode);
      rootSpan.finish();
    };

    res.on("close", finishSpan);
    res.on("finish", finishSpan);
    
    next();
  }
}
