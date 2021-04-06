import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";
import { Span } from "opentracing";

import { TracingService } from "../../core";

@Injectable()
export class HttpTracingMiddleware implements NestMiddleware {
  constructor(private readonly tracingService: TracingService) {}

  use(req: Request & { __rootSpan__: Span }, res: Response, next: () => void) {
    const rootSpan = this.tracingService.getSpanFromRequest(req);
    req.__rootSpan__ = rootSpan;

    this.tracingService.interceptReponseBody(res);

    this.tracingService.setRootSpan(rootSpan);
    const finishSpanAction = this.tracingService.getFinishSpanAction(rootSpan, res);

    res.on("close", finishSpanAction);
    res.on("finish", finishSpanAction);

    next();
  }
}
