# nest-opentracing

Implementation of [Distributed Tracing](https://opentracing.io) for Nest.js modules.

So far only the [express](https://github.com/expressjs/express) framework is supported.

# Usage

## Installing

```
npm i @byndyusoft/nest-opentracing @nestjs/axios @nestjs/common axios express
```

## Initialization

Import tracing module in your root module just **once**.

### [Jaeger](https://github.com/jaegertracing/jaeger-client-node) tracer

```typescript
import { JaegerTracingModule } from "@byndyusoft/nest-opentracing";

@Module({
  imports: [JaegerTracingModule.forRoot({ applyRoutes: ["v1/*"], ignoreRoutes: [] })],
  controllers: [AppController],
})
export class AppModule {}
```

### Custom tracer

```typescript
import { OpenTracingModule } from "@byndyusoft/nest-opentracing";

@Module({
  imports: [
    OpenTracingModule.forRootAsync({
      useFactory: () => ({
        tracer: initSomeTracer(),
        applyRoutes: ["v1/*"],
        ignoreRoutes: [],
      }),
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
```

### Log request/response bodies

```typescript
import { OpenTracingModule } from "@byndyusoft/nest-opentracing";

@Module({
  imports: [
    OpenTracingModule.forRootAsync({
      useFactory: () => ({
        applyRoutes: ["v1/*"],
        ignoreRoutes: [],
        logBodies: true,
      }),
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
```

### Tracing Nest.js HttpModule

```typescript
import { JaegerTracingModule, TracedHttpModule } from "@byndyusoft/nest-opentracing";

@Module({
  imports: [
    JaegerTracingModule.forRoot({ applyRoutes: [AppController], ignoreRoutes: [], logBodies: true }),
    TracedHttpModule.registerAsync({
      useFactory: () => ({
        logBodies: true,
      }),
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
```

## Configuration

### Jaeger tracer

Configures by [Jaeger environment variables](https://github.com/jaegertracing/jaeger-client-node#environment-variables) and next variables:

```
npm_package_version
NAMESPACE
NODE_ENV
```

### Traced HTTP module

`TracedHttpModule` can be configured via `registerAsync` pattern.

```typescript
import { JaegerTracingModule, TracedHttpModule } from "@byndyusoft/nest-opentracing";

@Module({
  imports: [
    TracedHttpModule.registerAsync({
      useFactory: () => ({
        logBodies: true,
      }),
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
```

## Async functions tracing

```typescript
import { TracingService } from "@byndyusoft/nest-opentracing";

@Controller()
class AppController {
  constructor(private readonly tracingService: TracingService) {}

  @Get("foo")
  async bar() {
    /* some code here */

    const asyncResult = await this.tracingService.traceAsyncFunction(
      "description",
      async () => await someAsyncAction("foo", "bar"),
    );

    /* some code here */
  }
}
```
