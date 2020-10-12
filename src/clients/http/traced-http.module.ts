import { DynamicModule, HttpModule, HttpModuleAsyncOptions, HttpService, Module } from "@nestjs/common";
import { TracingAxiosInterceptor } from "./axios-tracing.interceptor";

@Module({
  providers: [HttpService, TracingAxiosInterceptor],
  exports: [HttpService],
})
export class TracedHttpModule {
  public static forRoot(options: HttpModuleAsyncOptions): DynamicModule {
    const httpModule = HttpModule.registerAsync(options);
    
    return {
      ...httpModule,
      module: TracedHttpModule,
      global: true,
    };
  }

  public static registerAsync(options: HttpModuleAsyncOptions): DynamicModule {
    const httpModule = HttpModule.registerAsync(options);

    return {
      ...httpModule,
      module: TracedHttpModule,
    };
  }
}
