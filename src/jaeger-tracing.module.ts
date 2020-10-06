import { initTracerFromEnv, PrometheusMetricsFactory } from "jaeger-client";
import * as prometheusClient from "prom-client";
import * as os from "os";
import { DynamicModule, Module } from "@nestjs/common";
import { RouteInfo, Type } from "@nestjs/common/interfaces";
import { OpenTracingModule } from "./opentracing.module";

const createJaegerTracer = () => {
  const serviceName = process.env.npm_package_name;
  return initTracerFromEnv(
    {
      serviceName,
    },
    {
      tags: {
        [`${serviceName}.hostName`]: os.hostname(),
        [`${serviceName}.version`]: process.env.npm_package_version,
        [`${serviceName}.environment`]: process.env.NAMESPACE || process.env.NODE_ENV,
      },
      metrics: new PrometheusMetricsFactory(prometheusClient, ""),
    },
  );
};

const defaultIgnoreRoutes = ["metrics", "health", "_healthz", "_readiness", "favicon.ico", "api-docs"];

@Module({})
export class JaegerTracingModule {
  /**
   * @param options
   * @param options.applyRoutes Default: ["*"]
   * @param options.ignoreRoutes Default: ["metrics", "health", "_healthz", "_readiness", "favicon.ico", "api-docs"]
   */
  public static forRoot(options?: {
    applyRoutes?: (string | Type<any> | RouteInfo)[];
    ignoreRoutes?: (string | RouteInfo)[];
  }): DynamicModule {
    return {
      module: JaegerTracingModule,
      imports: [
        OpenTracingModule.forRoot({
          tracer: createJaegerTracer(),
          applyRoutes: options?.applyRoutes,
          ignoreRoutes: options?.ignoreRoutes ?? defaultIgnoreRoutes,
        }),
      ],
      exports: [OpenTracingModule],
    };
  }
}
