import { Global, MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AsyncContextModule } from "../../async-context";
import { AsyncContextMiddleware } from "./async-context.middleware";
import { HttpTracingMiddleware } from "./tracing.middleware";

// this module is global to ensure that middlewares are only called once
@Global()
@Module({ imports: [AsyncContextModule] })
export class HttpEnvironmentModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AsyncContextMiddleware)
      .forRoutes("v1/*")
      .apply(HttpTracingMiddleware)
      .forRoutes("v1/*");
  }
}
