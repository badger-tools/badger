import { buildStorage } from "../core/storage";
import { StoreOptions, Writable } from "../core/types";
import { WritableStore } from "../core/writable";

export const writable = <T>(data?: T, opts?: StoreOptions<T>): Writable<T> => {
  const options = {
    shouldUpdate: opts?.shouldUpdate,
    storage: buildStorage(opts?.storage),
  };
  const store = new WritableStore(data as T, options);

  const obj: Record<string, any> = {
    value: store.value,
  };

  const subscribe = (fn: (value: T) => void) => {
    return store.subscribe(fn);
  };

  const set = (value: T) => {
    store.set(value);
    obj.value = store.value;
  };

  const update = (fn: (value: T) => T) => {
    store.update(fn);
    obj.value = store.value;
  };
  obj.set = set;
  obj.subscribe = subscribe;
  obj.update = update;

  return obj as Writable<T>;
};
