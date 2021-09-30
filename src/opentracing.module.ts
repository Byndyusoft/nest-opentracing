import { DynamicModuleHelper, TRegisterAsyncOptions } from "@byndyusoft/nest-dynamic-module";
import { DynamicModule, Module } from "@nestjs/common";
import { AsyncContextModule } from "./async-context";
import { TracingCoreModule, TracingOptions } from "./core";
import { ITracingCoreModuleOptions } from "./core/options";
import { HttpEnvironmentModule } from "./environments";

@Module({
  imports: [AsyncContextModule, HttpEnvironmentModule],
})
export class OpenTracingModule {
  /**
   * @deprecated Use OpenTracingModule.forRootAsync instead
   */
  public static forRoot(options: ITracingCoreModuleOptions & TracingOptions): DynamicModule {
    return {
      // Make TracingService available in the whole app
      global: true,
      module: OpenTracingModule,
      imports: [TracingCoreModule.forRoot(options)],
      providers: [
        {
          provide: TracingOptions,
          useFactory: () => new TracingOptions(options),
        },
      ],
      exports: [TracingCoreModule, TracingOptions],
    };
  }

  public static forRootAsync(
    options?: TRegisterAsyncOptions<ITracingCoreModuleOptions & TracingOptions>,
  ): DynamicModule {
    return DynamicModuleHelper.registerAsync(
      {
        module: OpenTracingModule,
        global: true,
        imports: [TracingCoreModule.forRootAsync(options)],
        providers: [
          {
            provide: TracingOptions,
            inject: ["OpenTracingModuleOptions"],
            useFactory: (openTracingModuleOptions: ITracingCoreModuleOptions & TracingOptions) =>
              new TracingOptions(openTracingModuleOptions),
          },
        ],
        exports: [TracingCoreModule, TracingOptions],
      },
      "OpenTracingModuleOptions",
      options,
    );
  }
}
