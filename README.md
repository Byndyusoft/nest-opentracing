# nest-opentracing
OpenTracing node package for Nest.js with `express` implementation.

## Instalation

```
npm i nest-opentracing
```

## Usage

In your `app.module` import tracing modules

```javascript
import { JaegerTracingModule } from "nest-opentracing"

@Module({
  imports: [
    JaegerTracingModule.forRoot()
  ],
})
export class AppModule {}
```

TracingModule allows to use custom tracing path scopes

```javascript 
JaegerTracingModule.forRoot({
  applyRoutes: ["*"],
  ignoreRoutes: ["metrics"],
})
```

### Defining own opentracing tracer

Create module for your tracer


```javascript

const createTracerInstance = () => { ... };

@Module({
  imports: [OpenTracingModule.forRoot({ tracer: createTracerInstance() })],
  exports: [OpenTracingModule]
})
export class FooTracerModule {}
```

or just call it an root module:

```javascript
@Module({
  imports: [
    OpenTracingModule.forRoot({ tracer: myTracer }),
  ],
})
export class AppModule {}
```

### Using tracing for HTTP calls

In your root module

```javascript
@Module({
  imports: [
    JaegerTracingModule.forRoot(),
    TracedHttpModule.registerAsync({
      useFactory: async () => ({
        timeout: 2000, // timeout 2000ms for every request throught HttpService
      }),
    })
  ],
})
```

Factory is returning config for HttpModule
