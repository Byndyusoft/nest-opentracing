import { Injectable, NestMiddleware } from "@nestjs/common";
import { AsyncContext } from "../../async-context";

@Injectable()
export class AsyncContextMiddleware implements NestMiddleware {
  constructor(private readonly asyncContext: AsyncContext) {}

  public use(req: Request, res: Response, next: () => void) {
    this.asyncContext.run(next);
  }
}
