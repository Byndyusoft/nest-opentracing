import { DynamicModuleHelper, TRegisterAsyncOptions } from "@byndyusoft/nest-dynamic-module";
import { DynamicModule, Module } from "@nestjs/common";
import { AsyncContextModule } from "../async-context";
import { ITracingCoreModuleOptions } from "./options";
import { TracingService, Tracer } from "./tracing.service";
import * as opentracing from "opentracing";

const defaultOptions: ITracingCoreModuleOptions = {
  tracer: opentracing.globalTracer(),
  logBodies: false,
};

@Module({
  imports: [AsyncContextModule],
  providers: [TracingService],
  exports: [TracingService],
})
export class TracingCoreModule {
  /**
   * @deprecated Use TracingCoreModule.forRootAsync instead
   * @param options
   */
  static forRoot(options?: ITracingCoreModuleOptions): DynamicModule {
    options = Object.assign({}, defaultOptions, options);

    return {
      module: TracingCoreModule,
      providers: [
        {
          provide: Tracer,
          useFactory: () => options.tracerFactory?.() ?? options.tracer,
        },
        {
          provide: "ITracingCoreModuleOptions",
          useValue: options,
        },
      ],
    };
  }

  static forRootAsync(options?: TRegisterAsyncOptions<ITracingCoreModuleOptions>): DynamicModule {
    return DynamicModuleHelper.registerAsync(
      {
        module: TracingCoreModule,
        providers: [
          {
            provide: Tracer,
            inject: ["ITracingCoreModuleOptions"],
            useFactory: (tracingCoreModuleOptions: ITracingCoreModuleOptions) => tracingCoreModuleOptions.tracer,
          },
        ],
      },
      "ITracingCoreModuleOptions",
      {
        ...options,
        useFactory: async (...args: never[]) => Object.assign({}, defaultOptions, await options?.useFactory?.(...args)),
      },
    );
  }
}
