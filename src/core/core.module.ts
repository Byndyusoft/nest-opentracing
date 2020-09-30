import { DynamicModule, Module } from "@nestjs/common";
import { AsyncContextModule } from "../async-context";
import { TracingService, Tracer } from "./tracing.service";

@Module({
  imports: [AsyncContextModule],
  providers: [TracingService],
  exports: [TracingService],
})
export class TracingCoreModule {
  static forRoot(tracerInstance: Tracer): DynamicModule {
    return {
      global: true,
      module: TracingCoreModule,
      providers: [
        {
          provide: Tracer,
          useValue: tracerInstance,
        },
      ],
    };
  }
}
