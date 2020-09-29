import { DynamicModule, Module } from "@nestjs/common";
import { AsyncContextModule } from "./async-context";
import { TracingCoreModule } from "./core";
import { HttpEnvironmentModule } from "./environments";

@Module({
  imports: [AsyncContextModule, HttpEnvironmentModule]
})
export class TracingModule {
  public static forRoot(): DynamicModule {
    return {
      // Make TracingService available in the whole app
      global: true,
      module: TracingModule,
      imports: [TracingCoreModule.forRoot()],
      exports: [TracingCoreModule]
    };
  }
}
