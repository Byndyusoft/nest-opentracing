import { Span, MockTracer } from "opentracing";

import { AsyncContext } from "../async-context";
import { TracingService } from "./tracing.service";

const asyncContext = AsyncContext.getInstance();
const tracer = new MockTracer();

beforeEach(async () => {
  tracer.clear();
  return new Promise((res) => {
    asyncContext.run(() => res(""));
  });
});

it.todo("injects trace id to HTTP headers");
it.todo("extracts span context from Express.js request");

it("sets rootSpan in AsyncContext", async () => {
  const tracingService = new TracingService(tracer, asyncContext, {});
  const rootSpan = tracingService.initRootSpan("root span");
  const span = asyncContext.get<string, Span>("TRACING_ASYNC_CONTEXT_ROOT_SPAN");

  expect(rootSpan).toEqual(span);
});

it("returns correct rootSpan", async () => {
  const tracingService = new TracingService(tracer, asyncContext, {});
  const rootSpan = tracingService.initRootSpan("root span");

  expect(rootSpan).toEqual(tracingService.getRootSpan());
});

it("creates child span of rootSpan", async () => {
  const tracingService = new TracingService(tracer, asyncContext, {});
  tracingService.initRootSpan("root span");
  const childSpan = tracingService.createChildSpan("child span");
  const rootSpan = tracingService.getRootSpan();

  expect(childSpan.context().toTraceId()).toEqual(rootSpan.context().toTraceId());
});

describe("trace async function", () => {
  it("creates child span of rootSpan", async () => {
    const tracingService = new TracingService(tracer, asyncContext, {});
    const rootSpan = tracingService.initRootSpan("root span");

    tracingService.traceAsyncFunction("child async func", async (span) => {
      expect(span.context().toTraceId()).toEqual(rootSpan.context().toTraceId());
    });
  });

  it("executes async function", () => {
    const tracingService = new TracingService(tracer, asyncContext, {});
    tracingService.initRootSpan("root span");
    const callback = jest.fn();

    tracingService.traceAsyncFunction("child async func", async (span) => {
      callback(span);
    });

    expect(callback).toHaveBeenCalled();
  });

  describe("when error", () => {
    it("throws error", async () => {
      const tracingService = new TracingService(tracer, asyncContext, {});
      tracingService.initRootSpan("root span");

      await expect(
        tracingService.traceAsyncFunction("async func", async () => {
          throw new Error("some error");
        }),
      ).rejects.toThrow("some error");
    });

    it("add error tag", async () => {
      const tracingService = new TracingService(tracer, asyncContext, {});
      tracingService.initRootSpan("root span");

      try {
        await tracingService.traceAsyncFunction("async func", async () => {
          throw new Error("some error");
        });
      } catch (err) {}

      const report = tracer.report();
      const errorSpan = report.firstSpanWithTagValue("error", true);
      expect(errorSpan).not.toBeNull();
    });

    it("sets SAMPLING_PRIORITY=1 to span", async () => {
      const tracingService = new TracingService(tracer, asyncContext, {});
      tracingService.initRootSpan("root span");

      try {
        await tracingService.traceAsyncFunction("async func", async () => {
          throw new Error("some error");
        });
      } catch (err) {}

      const report = tracer.report();
      const span = report.firstSpanWithTagValue("sampling.priority", 1);
      expect(span).not.toBeNull();
    });
  });
});
