import { RouteInfo, Type } from "@nestjs/common/interfaces";

export class TracingOptions {
  public applyRoutes: (string | Type<any> | RouteInfo)[];
  public ignoreRoutes: (string | RouteInfo)[];

  constructor(options: {
    applyRoutes: (string | Type<any> | RouteInfo)[];
    ignoreRoutes: (string | RouteInfo)[];
  }) {
    this.applyRoutes = options.applyRoutes;
    this.ignoreRoutes = options.ignoreRoutes;
  }
}
