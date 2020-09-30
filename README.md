# nest-opentracing

## Instalation

```
npm i nest-opentracing
```

## Usage

In your `app.module` import tracing modules

```javascript
@Module({
  imports: [
    JaegerTracingModule,
    TracedHttpModule.registerAsync({
      useFactory: async (configService) => ({
        timeout: 2000,
      }),
    }),
  ],
})
export class AppModule {}
```

### Defining own opentracing tracer:

Create module for your tracer


```javascript

const createTracerInstance = () => { ... };

@Module({
  imports: [TracingModule.forRoot(createTracerInstance())],
  exports: [TracingModule]
})
export class FooTracerModule {}
```

or just call it an app.module:

```javascript
@Module({
  imports: [
    OpenTracingModule.forRoot(myTracer),
    TracedHttpModule.registerAsync({
      useFactory: async (configService) => ({
        timeout: 2000,
      }),
    }),
  ],
})
export class AppModule {}
```