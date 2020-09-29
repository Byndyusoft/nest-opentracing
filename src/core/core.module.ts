import { DynamicModule, Module } from "@nestjs/common";
import { AsyncContextModule } from "../async-context";
import { TracingService } from "./tracing.service";

@Module({
  imports: [AsyncContextModule],
  providers: [TracingService],
  exports: [TracingService]
})
export class TracingCoreModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: TracingCoreModule
    };
  }
}
