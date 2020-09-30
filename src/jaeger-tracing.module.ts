import { initTracerFromEnv, PrometheusMetricsFactory } from "jaeger-client";
import * as prometheusClient from "prom-client";
import * as os from "os";

import { OpenTracingModule } from "./opentracing.module";
import { Module } from "@nestjs/common";

const createJaegerTracer = () => {
  const serviceName = process.env.npm_package_name || "";
  const safeServiceName = serviceName.replace("-", "_");

  const tracer = initTracerFromEnv(
    { serviceName },
    {
      tags: {
        [`${serviceName}.hostName`]: os.hostname(),
        [`${serviceName}.version`]: process.env.npm_package_version,
        [`${serviceName}.environment`]: process.env.NAMESPACE || process.env.NODE_ENV
      },
      metrics: new PrometheusMetricsFactory(prometheusClient, safeServiceName)
    }
  );

  return tracer;
};

@Module({
  imports: [OpenTracingModule.forRoot(createJaegerTracer())],
  exports: [OpenTracingModule],
})
export class JaegerTracingModule {}
