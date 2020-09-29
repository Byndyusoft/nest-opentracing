# nest-opentracing

## Instalation

```
npm i nest-opentracing
```

## Usage

1. Create module for your tracer. Example:

```javascript
import { Module, Global } from "@nestjs/common";
import { Tracer } from "opentracing";

import { initTracer, PrometheusMetricsFactory } from "jaeger-client";
import * as prometheusClient from "prom-client";
import * as os from "os";

const createJaegerTracer = () => {
  const serviceName = process.env.npm_package_name;
  return initTracer(
    {
      serviceName,
      reporter: { collectorEndpoint: process.env.JAEGER_ENDPOINT },
      sampler: {
        param: Number(process.env.JAEGER_SAMPLER_PARAM) || 1,
        type: process.env.JAEGER_SAMPLER_TYPE || "const",
      },
    },
    {
      tags: {
        [`${serviceName}.hostName`]: os.hostname(),
        [`${serviceName}.version`]: process.env.npm_package_version,
        [`${serviceName}.environment`]:
          process.env.NAMESPACE || process.env.NODE_ENV,
      },
      metrics: new PrometheusMetricsFactory(prometheusClient, ""),
    }
  );
};

@Global()
@Module({
  providers: [
    {
      provide: Tracer,
      useValue: createJaegerTracer(),
    },
  ],
  exports: [Tracer],
})
export class JaegerModule {}
```

2. In your `app.module` import tracing modules

```javascript
@Module({
  imports: [
    JaegerModule,
    TracingModule.forRoot(),
    TracedHttpModule.registerAsync({
      useFactory: async (configService) => ({
        timeout: 2000,
      }),
    }),
  ],
})
export class AppModule {}
```
