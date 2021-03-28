import { Tracer } from "./tracing.service";

export interface ITracingCoreModuleOptions {
  tracer?: Tracer;
  tracerFactory?: () => Tracer;
  logBodies?: boolean;
}
