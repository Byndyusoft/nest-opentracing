import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";
import { TracingService } from "../../core";

@Injectable()
export class HttpTracingMiddleware implements NestMiddleware {
  constructor(private readonly tracingService: TracingService) {}

  use(req: Request, res: Response, next: () => void) {
    const rootSpan = this.tracingService.getSpanFromRequest(req);

    this.tracingService.setRootSpan(rootSpan);
    const finishSpanAction = this.tracingService.getFinishSpanAction(rootSpan, res);

    res.on("close", finishSpanAction);
    res.on("finish", finishSpanAction);
    
    next();
  }
}
