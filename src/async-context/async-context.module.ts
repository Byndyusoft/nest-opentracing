import { Global, Module } from "@nestjs/common";
import { AsyncContext } from "./async-context.core";

@Global()
@Module({
  providers: [
    {
      provide: AsyncContext,
      useValue: AsyncContext.getInstance()
    }
  ],
  exports: [AsyncContext]
})
export class AsyncContextModule {}
