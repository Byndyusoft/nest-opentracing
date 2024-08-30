import { OnModuleInit } from "@nestjs/common";
import * as asyncHooks from "async_hooks";
import { UnknownAsyncContextException } from "./unknown-async-context.exception";
import { AsyncHooksHelper } from "./async_hooks.helper";
import { AsyncHooksStorage } from "./async-context.storage";

export class AsyncContext implements OnModuleInit {
  public static getInstance(): AsyncContext {
    if (!this.instance) {
      this.initialize();
    }
    return this.instance;
  }

  private static instance: AsyncContext;

  private static initialize() {
    const asyncHooksStorage = new AsyncHooksStorage();
    const asyncHook = AsyncHooksHelper.createHooks(asyncHooksStorage);
    const storage = asyncHooksStorage.getInternalStorage();

    this.instance = new AsyncContext(storage, asyncHook);
  }

  private constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly internalStorage: Map<number, any>,
    private readonly asyncHookRef: asyncHooks.AsyncHook,
  ) {}

  public onModuleInit() {
    this.asyncHookRef.enable();
  }

  public set<TKey, TValue>(key: TKey, value: TValue) {
    const store = this.getAsyncStorage();
    store.set(key, value);
  }

  public get<TKey, TReturnValue>(key: TKey): TReturnValue {
    const store = this.getAsyncStorage();
    return store.get(key) as TReturnValue;
  }

  public run(fn: () => void) {
    const eid = asyncHooks.executionAsyncId();
    this.internalStorage.set(eid, new Map());
    fn();
  }

  private getAsyncStorage(): Map<unknown, unknown> {
    const eid = asyncHooks.executionAsyncId();
    const state = this.internalStorage.get(eid);
    if (!state) {
      throw new UnknownAsyncContextException(eid);
    }
    return state;
  }
}
