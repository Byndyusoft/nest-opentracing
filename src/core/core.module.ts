import { DynamicModule, Module } from "@nestjs/common";
import { AsyncContextModule } from "../async-context";
import { TracingService, Tracer } from "./tracing.service";

@Module({
  imports: [AsyncContextModule],
  providers: [TracingService],
  exports: [TracingService],
})
export class TracingCoreModule {
  static forRoot(options: { tracer: Tracer }): DynamicModule {
    return {
      module: TracingCoreModule,
      providers: [
        {
          provide: Tracer,
          useFactory: () => options.tracer,
        },
      ],
    };
  }
}
