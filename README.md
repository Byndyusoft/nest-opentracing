# nest-opentracing

Implementation of [Distributed Tracing](https://opentracing.io) for Nest.js modules.

So far only the [express](https://github.com/expressjs/express) framework is supported.

# Usage

## Installing

```
npm i @byndyusoft/nest-opentracing jaeger-client@3.18.1
```

## Initialization

Import tracing module in your root module just **once**. 

### [Jaeger](https://github.com/jaegertracing/jaeger-client-node) tracer

```javascript
import { JaegerTracingModule } from "nest-opentracing";

@Module({
  imports: [
    JaegerTracingModule.forRoot({ applyRoutes: ["v1/*"], ignoreRoutes: [] })
  ],
  controllers: [AppController]
})
export class AppModule {}
```

### Custom tracer

```javascript
import { OpenTracingModule } from "nest-opentracing";

const someTracerInstance = initSomeTracer(options);

@Module({
  imports: [
    OpenTracingModule.forRoot({ tracer: someTracerInstance, applyRoutes: ["v1/*"], ignoreRoutes: [] })
  ],
  controllers: [AppController]
})
export class AppModule {}
```

### Log request/response bodies

```javascript
import { OpenTracingModule } from "nest-opentracing";

const someTracerInstance = initSomeTracer(options);

@Module({
  imports: [
    OpenTracingModule.forRoot({ applyRoutes: ["v1/*"], ignoreRoutes: [], logBodies: true })
  ],
  controllers: [AppController]
})
export class AppModule {}
```

### Tracing Nest.js HttpModule

```javascript
import { JaegerTracingModule, TracedHttpModule } from "nest-opentracing";

@Module({
  imports: [
    JaegerTracingModule.forRoot({ applyRoutes: [AppController], ignoreRoutes: [], logBodies: true }),
    TracedHttpModule.forRoot({ logBodies: true })
  ],
  controllers: [AppController]
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

`TracedHttpModule` can be configured via `forRoot` pattern.

```javascript
import { JaegerTracingModule, TracedHttpModule } from "nest-opentracing";

@Module({
  imports: [
    TracedHttpModule.forRoot({ logBodies: true })
  ],
  controllers: [AppController]
})
export class AppModule {}
```


## Async functions tracing

```javascript
import { TracingService } from "nest-opentracing";

@Controller()
class AppController {
  constructor(private readonly TracingService tracingService) {}

  @Get("foo")
  async bar() {
    /* some code here */

    const asyncResult = await this.tracingService.traceAsyncFunction("description", async () => await someAsyncAction("foo", "bar"));

    /* some code here */
  }
}
```