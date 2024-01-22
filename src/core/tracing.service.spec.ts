import { Span, MockTracer } from "opentracing";
import { MockSpan, MockContext } from "opentracing/lib/mock_tracer";

import { AsyncContext } from "../async-context";
import { TracingService } from "./tracing.service";

const asyncContext = AsyncContext.getInstance();
const tracer = new MockTracer();

jest.spyOn(tracer, "extract").mockImplementation(() => new MockContext(new MockSpan(tracer)));

beforeEach(async () => {
  tracer.clear();
  return new Promise((res) => {
    asyncContext.run(() => res(""));
  });
});

it.todo("injects trace id to HTTP headers");
it.todo("extracts span context from Express.js request");

it("saves rootSpan in AsyncContext", async () => {
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

describe("get span from request", () => {
  const tracingService = new TracingService(tracer, asyncContext, { logBodies: true });

  const defaultRequest = {
    headers: {
      "uber-trace-id": "someTraceId",
    },
    baseUrl: "/api/v1/locations/1/users/2",
    method: "POST",
    query: {
      userVersion: 3,
    },
    body: {
      name: "newName",
    },
  };

  const rootSpan = tracingService.getSpanFromRequest(defaultRequest as never) as MockSpan;

  it("normalize base url in span name", () => {
    expect(rootSpan.operationName()).toBe("/api/v1/locations/#val/users/#val");
  });

  it("add params to tags", () => {
    expect(rootSpan.tags()["http.params_1"]).toBe("1");
    expect(rootSpan.tags()["http.params_2"]).toBe("2");
  });
});

describe("trace async function", () => {
  describe("when no root span", () => {
    it("creates root span", async () => {
      const tracingService = new TracingService(tracer, asyncContext, {});
      await tracingService.traceAsyncFunction("root async func", async (span) => {
        expect(span).toEqual(tracingService.getRootSpan());
      });
    });
  });

  it("creates child span of rootSpan", async () => {
    const tracingService = new TracingService(tracer, asyncContext, {});
    const rootSpan = tracingService.initRootSpan("root span");

    await tracingService.traceAsyncFunction("child async func", async (span) => {
      expect(span.context().toTraceId()).toEqual(rootSpan.context().toTraceId());
    });
  });

  it("executes async function", async () => {
    const tracingService = new TracingService(tracer, asyncContext, {});
    tracingService.initRootSpan("root span");
    const callback = jest.fn();

    await tracingService.traceAsyncFunction("child async func", async (span) => {
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
