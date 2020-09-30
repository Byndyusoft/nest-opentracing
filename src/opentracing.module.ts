import { DynamicModule, Module } from "@nestjs/common";
import { AsyncContextModule } from "./async-context";
import { TracingCoreModule, Tracer } from "./core";
import { HttpEnvironmentModule } from "./environments";

@Module({
  imports: [AsyncContextModule, HttpEnvironmentModule]
})
export class OpenTracingModule {
  public static forRoot(tracerInstance: Tracer): DynamicModule {
    return {
      // Make TracingService available in the whole app
      global: true,
      module: OpenTracingModule,
      imports: [TracingCoreModule.forRoot(tracerInstance)],
      exports: [TracingCoreModule]
    };
  }
}
