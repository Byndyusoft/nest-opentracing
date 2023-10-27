import { SpanContext, Tracer, FORMAT_HTTP_HEADERS } from "opentracing";
import { JaegerTracer } from "jaeger-client";

// is the header key used for a span's serialized context.
const TRACER_STATE_HEADER_NAME = "uber-trace-id";

// https://www.jaegertracing.io/docs/1.50/client-libraries/#tracespan-identity
export class TraceContextBuilder {
  private sampled = true;
  private spanId = "";
  private traceId = "";
  private parentSpanId: string;

  constructor(private readonly tracer?: JaegerTracer | Tracer) {}

  public setTraceId(traceId: string): TraceContextBuilder {
    this.traceId = traceId;

    return this;
  }

  public setSpanId(spanId: string): TraceContextBuilder {
    this.spanId = spanId;

    return this;
  }

  public setParentSpanId(parentSpanId: string): TraceContextBuilder {
    this.parentSpanId = parentSpanId;

    return this;
  }

  public build(): SpanContext {
    return this.tracer.extract(FORMAT_HTTP_HEADERS, {
      [TRACER_STATE_HEADER_NAME]: this.buildTracerState(),
    });
  }

  private buildTracerState(): string {
    const parentSpanId = this.parentSpanId ?? this.traceId;
    const sampledFlag = this.sampled ? "1" : "0";

    return `${this.traceId}:${this.spanId}:${parentSpanId}:${sampledFlag}`;
  }
}
