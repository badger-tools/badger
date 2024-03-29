import { ListenerFn, StoreOptions, Writable } from "./types";

class WritableStore<T> implements Writable<T> {
	#value: T;
	#opts?: StoreOptions<T>;
	#listeners: ListenerFn<T>[] = [];

	constructor(initialValue: T, opts?: StoreOptions<T>) {
		this.#value = initialValue;
		this.#opts = opts;
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
		}
	}
}

export const writable = <T>(data: T, opts?: StoreOptions<T>): Writable<T> => {
	return new WritableStore(data, opts);
};
