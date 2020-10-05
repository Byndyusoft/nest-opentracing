import { RouteInfo, Type } from "@nestjs/common/interfaces";

const defaultIgnoreRoutes = [];

const defaultApplyRoutes = ["*"];

export class TracingOptions {
  public applyRoutes: (string | Type<any> | RouteInfo)[];
  public ignoreRoutes: (string | RouteInfo)[];

  constructor(options: {
    applyRoutes?: (string | Type<any> | RouteInfo)[];
    ignoreRoutes?: (string | RouteInfo)[];
  }) {
    this.applyRoutes = options?.applyRoutes ? options.applyRoutes : defaultApplyRoutes;
    this.ignoreRoutes = options?.ignoreRoutes ? options.ignoreRoutes : defaultIgnoreRoutes;
  }
}
