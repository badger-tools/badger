import { buildStorage } from "./storage";
import type { ListenerFn, StoreOptions, Writable, WritableOptions } from "./types";

class WritableStore<T> implements Writable<T> {
	#value: T;
	#opts?: WritableOptions<T>;
	#listeners: ListenerFn<T>[] = [];

	constructor(initialValue: T, opts?: WritableOptions<T>) {
		this.#value = initialValue;
		this.#opts = opts;
		if (this.#opts?.storage) {
			const storedValue = this.#opts.storage.getItem(this.#opts.storage.key);
			if (storedValue) {
				this.#value = storedValue;
			}
		}
	}

	private updateInternalStore() {
		if (this.#opts?.storage) {
			this.#opts.storage.setItem(this.#opts.storage.key, this.#value);
		}
	}

	public get value(): T {
		return this.#value;
	}

	/**
	 * Sets the internal value to the newly provided one.
	 *
	 * @remarks
	 * If the Atom has a `shouldUpdate` function defined, that
	 * will be used to determine if the value should be updated.
	 */
	set(val: T) {
		if (
			this.#value === undefined ||
			!this.#opts?.shouldUpdate ||
			this.#opts?.shouldUpdate(this.#value, val)
		) {
			this.#value = val;
			this.#listeners.forEach((fn) => fn(val));
			this.updateInternalStore();
		}
	}

	/**
	 * Subscribes a given function to all value changes for the Atom
	 *
	 * @remarks
	 * The listener fn is called immediately with the current value.
	 */
	subscribe(fn: (v: T) => void) {
		this.#listeners.push(fn);
		if (this.#value !== undefined) {
			fn(this.#value);
		}

		// unsubscribe method
		return () => {
			const idx = this.#listeners.findIndex((el) => el === fn);
			if (idx >= 0 && idx < this.#listeners.length) {
				this.#listeners.splice(idx, 1);
			}
		};
	}

	/**
	 * Sets the internal value based on the map function provided.
	 *
	 * @remarks
	 * If the Atom has a `shouldUpdate` function defined, that
	 * will be used to determine if the value should be updated.
	 */
	update(updateFn: (val: T) => T) {
		if (this.#value === undefined) {
			return;
		}
		const newValue = updateFn(this.#value);
		if (
			!this.#opts?.shouldUpdate ||
			this.#opts?.shouldUpdate(this.#value, newValue)
		) {
			this.#value = newValue;
			this.#listeners.forEach((fn) => fn(newValue));
			this.updateInternalStore();
		}
	}
}

/**
 * Creates a writable store with the provided data and options.
 *
 * @param data - The initial value of the store
 * @param opts - Options for the store
 * @returns A writable store
 */
export const writable = <T>(data?: T, opts?: StoreOptions<T>): Writable<T> => {
	const options = {
		shouldUpdate: opts?.shouldUpdate,
		storage: buildStorage(opts?.storage),
	};
	return new WritableStore(data as T, options);
};
