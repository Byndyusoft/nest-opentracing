import { DynamicModule, Module } from "@nestjs/common";
import { RouteInfo, Type } from "@nestjs/common/interfaces";
import { AsyncContextModule } from "./async-context";
import { TracingCoreModule, Tracer, TracingOptions } from "./core";
import { HttpEnvironmentModule } from "./environments";

@Module({
  imports: [AsyncContextModule, HttpEnvironmentModule],
})
export class OpenTracingModule {
  public static forRoot(options: {
    tracer: Tracer;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    applyRoutes: (string | Type<any> | RouteInfo)[];
    ignoreRoutes: (string | RouteInfo)[];
    logBodies?: boolean;
  }): DynamicModule {
    return {
      // Make TracingService available in the whole app
      global: true,
      module: OpenTracingModule,
      imports: [TracingCoreModule.forRoot(options)],
      providers: [
        {
          provide: TracingOptions,
          useFactory: () => new TracingOptions(options),
        },
      ],
      exports: [TracingCoreModule, TracingOptions],
    };
  }
}
