import { DynamicModule, HttpModule, Module } from "@nestjs/common";
import { TracingAxiosInterceptor } from "./axios-tracing.interceptor";

@Module({
  imports: [HttpModule],
  providers: [TracingAxiosInterceptor],
  exports: [TracingAxiosInterceptor],
})
export class TracedHttpModule {
  public static forRoot(): DynamicModule {
    return {
      module: TracedHttpModule,
      global: true,
    };
  }
}
