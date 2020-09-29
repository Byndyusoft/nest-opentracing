import * as asyncHooks from "async_hooks";
import { AsyncHooksStorage } from "./async-context.storage";

export class AsyncHooksHelper {
  public static createHooks(storage: AsyncHooksStorage): asyncHooks.AsyncHook {
    function init(
      asyncId: number,
      type: string,
      triggerId: number,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      resource: object
    ) {
      if (storage.has(triggerId)) {
        storage.inherit(asyncId, triggerId);
      }
    }

    function destroy(asyncId: number) {
      storage.delete(asyncId);
    }

    return asyncHooks.createHook({
      init,
      destroy
    } as asyncHooks.HookCallbacks);
  }
}
