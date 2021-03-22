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
  static forRoot(options?: ITracingCoreModuleOptions): DynamicModule {
    options = Object.assign({}, defaultOptions, options);

    return {
      module: TracingCoreModule,
      providers: [
        {
          provide: Tracer,
          useFactory: () => options.tracer,
        },
        {
          provide: "ITracingCoreModuleOptions",
          useValue: options,
        },
      ],
    };
  }
}
