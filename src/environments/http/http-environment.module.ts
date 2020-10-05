import { Global, MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TracingOptions } from "../../core";
import { AsyncContextModule } from "../../async-context";
import { AsyncContextMiddleware } from "./async-context.middleware";
import { HttpTracingMiddleware } from "./tracing.middleware";

// this module is global to ensure that middlewares are only called once
@Global()
@Module({ imports: [AsyncContextModule] })
export class HttpEnvironmentModule implements NestModule {
  constructor(private readonly options: TracingOptions) {}
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AsyncContextMiddleware)
      .exclude(...this.options.ignoreRoutes)
      .forRoutes(...this.options.applyRoutes)

      .apply(HttpTracingMiddleware)
      .exclude(...this.options.ignoreRoutes)
      .forRoutes(...this.options.applyRoutes);
  }
}
