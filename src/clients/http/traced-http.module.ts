import { HttpModule } from "@nestjs/axios";
import { DynamicModule, Module } from "@nestjs/common";
import { TracingAxiosInterceptor } from "./axios-tracing.interceptor";
import { ITracedHttpModuleOptions } from "./options";

const defaultOptions: ITracedHttpModuleOptions = {
  logBodies: false,
};

@Module({
  imports: [HttpModule],
  providers: [TracingAxiosInterceptor],
  exports: [TracingAxiosInterceptor],
})
export class TracedHttpModule {
  public static forRoot(options?: ITracedHttpModuleOptions): DynamicModule {
    options = Object.assign({}, defaultOptions, options);

    return {
      module: TracedHttpModule,
      global: true,
      providers: [
        {
          provide: "ITracedHttpModuleOptions",
          useValue: options,
        },
      ],
    };
  }
}
