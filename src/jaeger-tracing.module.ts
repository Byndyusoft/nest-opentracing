import { initTracerFromEnv, PrometheusMetricsFactory } from "jaeger-client";
import * as prometheusClient from "prom-client";
import * as os from "os";
import { DynamicModule, Module } from "@nestjs/common";
import { RouteInfo, Type } from "@nestjs/common/interfaces";
import { OpenTracingModule } from "./opentracing.module";

const createJaegerTracer = () => {
  return initTracerFromEnv(
    {
      serviceName: process.env.npm_package_name,
    },
    {
      tags: {
        hostname: os.hostname(),
        version: process.env.npm_package_version,
        environment: process.env.NAMESPACE || process.env.NODE_ENV,
      },
      metrics: new PrometheusMetricsFactory(prometheusClient, ""),
    },
  );
};

@Module({})
export class JaegerTracingModule {
  public static forRoot(options: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    applyRoutes: (string | Type<any> | RouteInfo)[];
    ignoreRoutes: (string | RouteInfo)[];
    logBodies?: boolean;
  }): DynamicModule {
    return {
      module: JaegerTracingModule,
      imports: [
        OpenTracingModule.forRoot({
          ...options,
          tracer: createJaegerTracer(),
        }),
      ],
      exports: [OpenTracingModule],
    };
  }
}
