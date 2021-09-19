import { Tracer } from "./tracing.service";

export interface ITracingCoreModuleOptions {
  tracer?: Tracer;
  /**
   * @deprecated Use OpenTracingModule.forRootAsync to pass tracer via factory
   */
  tracerFactory?: () => Tracer;
  logBodies?: boolean;
}
