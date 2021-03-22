import { Tracer } from "./tracing.service";

export interface ITracingCoreModuleOptions {
  tracer?: Tracer;
  logBodies?: boolean;
}
