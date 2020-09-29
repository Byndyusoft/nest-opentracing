import { Injectable } from "@nestjs/common";
import { Request } from "express";

import {
  Span,
  Tracer,
  FORMAT_HTTP_HEADERS,
  initGlobalTracer,
  Tags,
} from "opentracing";
export { Span, Tracer, Tags } from "opentracing";

import { TracingNotInitializedException } from "./tracing-not-initialized.exception";
export { TracingNotInitializedException } from "./tracing-not-initialized.exception";

import { AsyncContext, UnknownAsyncContextException } from "../async-context";

const TRACING_ASYNC_CONTEXT_ROOT_SPAN = "TRACING_ASYNC_CONTEXT_ROOT_SPAN";

@Injectable()
export class TracingService {
  constructor(
    private readonly tracer: Tracer,
    private readonly asyncContext: AsyncContext
  ) {
    initGlobalTracer(tracer);
  }

  public getSpanFromRequest(request: Request) {
    const tracer = this.tracer;
    const { headers, baseUrl, method, query, body } = request;
    const parentSpanContext = tracer.extract(FORMAT_HTTP_HEADERS, headers);
    const span = tracer.startSpan(baseUrl, { childOf: parentSpanContext });

    span.setTag(Tags.HTTP_METHOD, method.toUpperCase());
    span.setTag(Tags.HTTP_URL, baseUrl);
    span.log({ Request: { query, body } });

    return span;
  }

  public setRootSpan(span: Span) {
    try {
      this.asyncContext.set(TRACING_ASYNC_CONTEXT_ROOT_SPAN, span);
    } catch (err) {
      if (err instanceof UnknownAsyncContextException) {
        throw new TracingNotInitializedException();
      }
      throw err;
    }
  }

  public getRootSpan(): Span {
    try {
      return this.asyncContext.get<string, Span>(
        TRACING_ASYNC_CONTEXT_ROOT_SPAN
      );
    } catch (err) {
      if (err instanceof UnknownAsyncContextException) {
        throw new TracingNotInitializedException();
      }
      throw err;
    }
  }

  public createChildSpan(spanName: string) {
    const rootSpan = this.getRootSpan();
    const span = this.tracer.startSpan(spanName, { childOf: rootSpan });
    return span;
  }

  async traceAsyncFunction<T>(
    spanName: string,
    func: (span: Span) => Promise<T>
  ): Promise<T> {
    const span = this.createChildSpan(spanName);
    try {
      return await func(span);
    } catch (error) {
      span.setTag(Tags.ERROR, true);
      span.setTag(Tags.SAMPLING_PRIORITY, 1);
      span.log({
        event: "error",
        message: error.message,
        stack: error.stack,
      });

      throw error;
    } finally {
      span.finish();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getInjectedHeaders(span: Span): any {
    const headers = {};
    this.tracer.inject(span, FORMAT_HTTP_HEADERS, headers);
    return headers;
  }
}
