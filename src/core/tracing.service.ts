import { Inject, Injectable, OnApplicationShutdown } from "@nestjs/common";
import { Request, Response } from "express";
import { JaegerTracer } from "jaeger-client";

import { Span, Tracer, FORMAT_HTTP_HEADERS, Tags, initGlobalTracer, SpanContext } from "opentracing";
export { Span, Tracer, Tags } from "opentracing";
import UrlValueParser = require("url-value-parser");

import { TracingNotInitializedException } from "./tracing-not-initialized.exception";
export { TracingNotInitializedException } from "./tracing-not-initialized.exception";

import { AsyncContext, UnknownAsyncContextException } from "../async-context";
import { ITracingCoreModuleOptions } from "./options";
import { BodyService } from "./body.service";
import { TraceContextBuilder } from "./trace-context.builder";

const urlParser = new UrlValueParser({ extraMasks: [/^(?!v\d$).*\d+.*$/] });

const TRACING_ASYNC_CONTEXT_ROOT_SPAN = "TRACING_ASYNC_CONTEXT_ROOT_SPAN";

const getQueryTags = (query: Record<string, unknown>, prefix: string = null) => {
  return Object.entries(query).reduce((acc, [key, value]) => {
    const queryKey = prefix ? `${prefix}.${key}` : key;
    return { ...acc, [queryKey]: value };
  }, {});
};

const isCriticalStatusCode = (statusCode: number) => statusCode >= 500;

@Injectable()
export class TracingService implements OnApplicationShutdown {
  constructor(
    @Inject(Tracer) private readonly tracer: JaegerTracer | Tracer,
    private readonly asyncContext: AsyncContext,
    @Inject("ITracingCoreModuleOptions") private readonly options: ITracingCoreModuleOptions,
  ) {
    initGlobalTracer(tracer);
  }

  public traceContextBuilder(): TraceContextBuilder {
    return new TraceContextBuilder(this.tracer);
  }

  public getSpanFromRequest(req: Request) {
    const tracer = this.tracer;
    const { headers, baseUrl, method, query, body } = req;

    const normalizedBaseUrl = urlParser.replacePathValues(baseUrl, "#val");
    const pathValues = urlParser.parsePathValues(baseUrl);

    const parentSpanContext = tracer.extract(FORMAT_HTTP_HEADERS, headers);

    const span = tracer.startSpan(normalizedBaseUrl, { childOf: parentSpanContext });

    span.setTag(Tags.HTTP_METHOD, method.toUpperCase());
    span.setTag(Tags.HTTP_URL, baseUrl);

    for (let i = 0; i < pathValues.valueIndexes.length; ++i) {
      span.setTag(`http.params_${i + 1}`, pathValues.chunks[pathValues.valueIndexes[i]]);
    }

    span.addTags(getQueryTags(query, "query"));

    if (this.options.logBodies) {
      span.log({ request: { body: BodyService.getBody(body) } });
    }

    return span;
  }

  public initRootSpan(spanName: string, spanContext?: SpanContext): Span {
    const span = this.tracer.startSpan(spanName, { childOf: spanContext });
    this.setRootSpan(span);
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
      return this.asyncContext.get<string, Span>(TRACING_ASYNC_CONTEXT_ROOT_SPAN);
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

  public getInjectedHeaders(span: Span): any {
    const headers = {};
    this.tracer.inject(span, FORMAT_HTTP_HEADERS, headers);
    return headers;
  }

  public createAsyncContext(): void {
    this.asyncContext.run(() => "");
  }

  public async traceAsyncFunction<T>(spanName: string, func: (span: Span) => Promise<T>): Promise<T> {
    const rootSpan = this.getRootSpan();
    let span: Span;
    if (!rootSpan) {
      span = this.initRootSpan(spanName);
    } else {
      span = this.createChildSpan(spanName);
    }

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

  public getFinishSpanAction(span: Span, response: Response): () => void {
    return () => {
      const statusCode = response.statusCode;
      span.setTag(Tags.HTTP_STATUS_CODE, statusCode);

      if (this.options.logBodies) {
        const { body } = response as unknown as Record<string, unknown>;
        span.log({ response: { body: BodyService.getBody(body) } });
      }

      if (isCriticalStatusCode(statusCode)) {
        span.setTag(Tags.SAMPLING_PRIORITY, 1);
        span.setTag(Tags.ERROR, true);
      }

      span.finish();
    };
  }

  public interceptReponseBody(res: Response) {
    const [oldSend] = [res.send];

    const response = res as unknown as Record<string, unknown>;

    response.send = function (...args) {
      const body = args.length > 0 ? args[0] : undefined;
      response.body = BodyService.getBody(body);
      return oldSend.apply(res, args);
    };
  }

  public onApplicationShutdown(): Promise<void> {
    return new Promise((resolve) => {
      if ("close" in this.tracer) {
        this.tracer.close(resolve);
      } else {
        resolve();
      }
    });
  }
}
