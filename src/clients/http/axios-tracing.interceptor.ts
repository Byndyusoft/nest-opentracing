import { HttpService, Injectable, OnModuleInit } from "@nestjs/common";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import { Span, Tags } from "opentracing";

import { TracingService, TracingNotInitializedException } from "../../core";

const TRACING_AXIOS_CONFIG_KEY = Symbol("kTracingAxiosInterceptor");

interface TracedAxiosRequestConfig extends AxiosRequestConfig {
  [TRACING_AXIOS_CONFIG_KEY]?: {
    childSpan: Span;
  };
}

const isAxiosError = (error: Record<string, unknown>) => error.isAxiosError && error.isAxiosError === true;
const isErrorStatus = (status: number) => status >= 400;

@Injectable()
export class TracingAxiosInterceptor implements OnModuleInit {
  constructor(private readonly tracingService: TracingService, private readonly httpService: HttpService) {}

  onModuleInit() {
    const axiosRef = this.httpService.axiosRef;
    axiosRef.interceptors.request.use(this.requestFulfilled(), this.requestRejected());
    axiosRef.interceptors.response.use(this.responseFulfilled(), this.responseRejected());
  }

  private requestFulfilled(): (axiosConfig: TracedAxiosRequestConfig) => TracedAxiosRequestConfig {
    return (axiosConfig) => {
      try {
        const span = this.tracingService.createChildSpan("http-call");
        span.setTag(Tags.HTTP_URL, axiosConfig.url);
        axiosConfig[TRACING_AXIOS_CONFIG_KEY] = {
          childSpan: span,
        };

        span.log({ request: { data: axiosConfig.data, params: axiosConfig.params } });

        const tracingHeaders = this.tracingService.getInjectedHeaders(span);
        axiosConfig.headers = { ...axiosConfig.headers, ...tracingHeaders };

        return axiosConfig;
      } catch (error) {
        if (error instanceof TracingNotInitializedException) {
          // TODO: Define proper behaviour for this case:
          // - should we create a new root segment for this?
          // - should we log the error so the user can investigate why its occuring?
          return axiosConfig;
        }

        throw error;
      }
    };
  }

  private requestRejected(): (error: any) => any {
    // Cause: Networking Error
    // Add error to Span
    // Close Span
    return (error) => {
      if (isAxiosError(error)) {
        try {
          const span = this.getSpanFromConfig(error.config);

          if (span) {
            span.setTag(Tags.ERROR, true);
            span.setTag(Tags.SAMPLING_PRIORITY, 1);
            span.log({
              event: "error",
              message: error.message,
            });
            span.finish();
          }
        } catch (tracingError) {
          // request error is "more important" than the error from tracing
          // so we swallow the tracing exception (probably TracingNotInitializedException)
        }
      }

      throw error;
    };
  }

  private responseFulfilled(): (response: AxiosResponse) => AxiosResponse {
    return (response) => {
      const span = this.getSpanFromConfig(response.config);
      try {
        if (span) {
          span.setTag(Tags.HTTP_STATUS_CODE, response.status);
          span.setTag(Tags.HTTP_METHOD, response.config.method.toUpperCase());

          span.log({ response: { data: response.data } });

          if (isErrorStatus(response.status)) {
            span.setTag(Tags.ERROR, true);
            span.setTag(Tags.SAMPLING_PRIORITY, 1);
            span.log({
              event: "error",
              message: `Request finished with status code: ${response.status}`,
            });
          }
        }
      } catch (err) {
        if (err instanceof TracingNotInitializedException) {
          return response;
        }

        throw err;
      } finally {
        if (span) {
          span.finish();
        }
      }
      return response;
    };
  }

  private responseRejected(): (error: any) => any {
    // Non 2xx Status Code
    // Add error to Span
    // Close Span
    return (error) => {
      if (isAxiosError(error)) {
        try {
          const span = this.getSpanFromConfig(error.config);

          if (span) {
            span.setTag(Tags.ERROR, true);
            span.setTag(Tags.SAMPLING_PRIORITY, 1);
            span.setTag(Tags.HTTP_METHOD, error.config.method);

            if (error.request && error.response) {
              span.setTag(Tags.HTTP_STATUS_CODE, error.response.status);
            } else if (error.config) {
              // Networking Error
              span.log({ event: "error", message: "Networking error" });
            }
            span.finish();
          }
        } catch (tracingError) {
          // response error is "more important" than the error from tracing
          // so we swallow the tracing exception (probably TracingNotInitializedException)
        }
      }

      throw error;
    };
  }

  private getSpanFromConfig(config: TracedAxiosRequestConfig): Span | null {
    const tracingData = config[TRACING_AXIOS_CONFIG_KEY];
    if (tracingData !== undefined && tracingData.childSpan) {
      return tracingData.childSpan;
    }

    return null;
  }
}
