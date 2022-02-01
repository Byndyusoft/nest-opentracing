import { DynamicModuleHelper, TRegisterAsyncOptions } from "@byndyusoft/nest-dynamic-module";
import { HttpModule } from "@nestjs/axios";
import { DynamicModule, Module } from "@nestjs/common";
import { TracingAxiosInterceptor } from "./axios-tracing.interceptor";
import { ITracedHttpModuleOptions } from "./options";

const defaultOptions: ITracedHttpModuleOptions = {
  logBodies: false,
};

@Module({
  providers: [TracingAxiosInterceptor],
})
export class TracedHttpModule {
  /**
   * @deprecated Use registerAsync instead
   * @param options
   */
  public static forRoot(options?: ITracedHttpModuleOptions): DynamicModule {
    options = Object.assign({}, defaultOptions, options);

    return {
      module: TracedHttpModule,
      global: true,
      imports: [HttpModule],
      providers: [
        {
          provide: "ITracedHttpModuleOptions",
          useValue: options,
        },
      ],
    };
  }

  public static registerAsync(options?: TRegisterAsyncOptions<ITracedHttpModuleOptions>): DynamicModule {
    return DynamicModuleHelper.registerAsync(
      {
        module: TracedHttpModule,
        imports: options?.imports && options.imports.length > 0 ? [] : [HttpModule],
      },
      "ITracedHttpModuleOptions",
      {
        ...options,
        useFactory: async (...args: never[]) => Object.assign({}, defaultOptions, await options?.useFactory?.(...args)),
      },
    );
  }
}
