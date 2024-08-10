import { Readable, StoreOptions, StoreType, Writable } from "./types";

import { writable } from "./writable";

const getStoreValue = <T>(
	store: (Readable<T> | Writable<T>) | (Readable<T> | Writable<T>)[],
) => {
	return Array.isArray(store) ? store.map((a) => a.value) : store.value;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class ReadableStore<T> implements Readable<T> {
	#value: Writable<T>;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	constructor(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		stores: (Readable<any> | Writable<any>) | (Readable<any> | Writable<any>)[],
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		selector: (values: any, set: (newValue: T) => void) => void,
		opts?: StoreOptions<T>,
	) {
		this.#value = writable<T>(undefined as unknown as T, opts) as Writable<T>;
		selector(getStoreValue(stores), (newValue: T) => {
			return this.#value.set(newValue);
		});

		(Array.isArray(stores) ? stores : [stores]).forEach((store) => {
			store.subscribe(() => {
				const currentValues = getStoreValue(stores);
				selector(currentValues, (newValue: T) => {
					this.#value.set(newValue);
				});
			});
		});
	}

	public get value(): T {
		return this.#value.value;
	}

	subscribe(fn: (v: T) => void) {
		return this.#value.subscribe(fn);
	}
}

// Overload for multiple stores
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function derived<S extends Writable<any> | Readable<any>, U>(
	store: S,
	selector: (value: StoreType<S>, set: (newValue: U) => void) => void,
	opts?: StoreOptions<U>,
): Readable<U>;

// Overload for multiple stores
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function derived<S extends Array<Writable<any> | Readable<any>>, U>(
	stores: [...S],
	selector: (
		values: { [K in keyof S]: StoreType<S[K]> },
		set: (newValue: U) => void,
	) => void,
	opts?: StoreOptions<U>,
): Readable<U>;

// Implementation (no change needed, but ensure to match the signature)
export function derived<S, U>(
	stores: S | S[],
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	selector: (values: any, set: (newValue: U) => void) => U | void,
	opts?: StoreOptions<U>,
): Readable<U> {
	const normalizedStores = stores as ( // eslint-disable-next-line @typescript-eslint/no-explicit-any
		| Writable<any>
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		| Readable<any>
	)[];

	const store = new ReadableStore<U>(normalizedStores, selector, opts);
	return store;
}
